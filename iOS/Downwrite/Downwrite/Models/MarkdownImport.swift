import Foundation

struct MarkdownImportFile: Equatable, Identifiable, Sendable {
	let id: String
	let fileName: String
	let title: String
	let content: String
	let byteCount: Int

	var characterCount: Int {
		content.count
	}
}

struct MarkdownImportFailure: Identifiable {
	let id = UUID()
	let message: String
}

enum MarkdownImportFileError: LocalizedError, Equatable {
	case noFiles
	case unsupportedFile(String)
	case unreadableFile(String)
	case invalidEncoding(String)
	case tooManyFiles(maximum: Int)
	case fileTooLarge(String, maximumBytes: Int)
	case batchTooLarge(maximumBytes: Int)

	var errorDescription: String? {
		switch self {
		case .noFiles:
			"Choose at least one Markdown file."
		case .unsupportedFile(let name):
			"\(name) is not a .md or .markdown file."
		case .unreadableFile(let name):
			"Downwrite could not read \(name)."
		case .invalidEncoding(let name):
			"\(name) is not valid UTF-8 text."
		case .tooManyFiles(let maximum):
			"Choose no more than \(maximum) Markdown files at once."
		case .fileTooLarge(let name, let maximumBytes):
			"\(name) is larger than \(maximumBytes.formatted(.byteCount(style: .file)))."
		case .batchTooLarge(let maximumBytes):
			"The selected files exceed the \(maximumBytes.formatted(.byteCount(style: .file))) import limit."
		}
	}
}

enum MarkdownImportFileLoader {
	nonisolated static let maximumFileCount = 50
	nonisolated static let maximumFileBytes = 5 * 1_024 * 1_024
	nonisolated static let maximumBatchBytes = 20 * 1_024 * 1_024
	nonisolated private static let maximumConcurrentReads = 4
	nonisolated private static let readChunkSize = 64 * 1_024

	nonisolated static func loadFiles(from urls: [URL]) async throws -> [MarkdownImportFile] {
		guard !urls.isEmpty else {
			throw MarkdownImportFileError.noFiles
		}
		guard urls.count <= maximumFileCount else {
			throw MarkdownImportFileError.tooManyFiles(maximum: maximumFileCount)
		}

		return try await withThrowingTaskGroup(
			of: (Int, MarkdownImportFile).self,
			returning: [MarkdownImportFile].self
		) { group in
			var nextIndex = 0
			while nextIndex < min(maximumConcurrentReads, urls.count) {
				let index = nextIndex
				let url = urls[index]
				group.addTask {
					try Task.checkCancellation()
					return (index, try readFile(at: url))
				}
				nextIndex += 1
			}

			var files = Array<MarkdownImportFile?>(repeating: nil, count: urls.count)
			var totalBytes = 0
			for try await (index, file) in group {
				totalBytes += file.byteCount
				guard totalBytes <= maximumBatchBytes else {
					group.cancelAll()
					throw MarkdownImportFileError.batchTooLarge(maximumBytes: maximumBatchBytes)
				}
				files[index] = file
				if nextIndex < urls.count {
					let pendingIndex = nextIndex
					let pendingURL = urls[pendingIndex]
					group.addTask {
						try Task.checkCancellation()
						return (pendingIndex, try readFile(at: pendingURL))
					}
					nextIndex += 1
				}
			}
			return files.compactMap { $0 }
		}
	}

	nonisolated private static func readFile(at url: URL) throws -> MarkdownImportFile {
		let fileName = url.lastPathComponent
		let fileExtension = url.pathExtension.lowercased()
		guard fileExtension == "md" || fileExtension == "markdown" else {
			throw MarkdownImportFileError.unsupportedFile(fileName)
		}

		let isAccessing = url.startAccessingSecurityScopedResource()
		defer {
			if isAccessing {
				url.stopAccessingSecurityScopedResource()
			}
		}

		let data: Data
		do {
			data = try coordinatedData(at: url, fileName: fileName)
		}
		catch let error as MarkdownImportFileError {
			throw error
		}
		catch is CancellationError {
			throw CancellationError()
		}
		catch {
			throw MarkdownImportFileError.unreadableFile(fileName)
		}
		guard let content = String(data: data, encoding: .utf8) else {
			throw MarkdownImportFileError.invalidEncoding(fileName)
		}

		return MarkdownImportFile(
			id: url.absoluteString,
			fileName: fileName,
			title: title(from: fileName),
			content: content,
			byteCount: data.count
		)
	}

	nonisolated private static func coordinatedData(at url: URL, fileName: String) throws -> Data {
		let coordinator = NSFileCoordinator()
		var coordinationError: NSError?
		var result: Result<Data, Error>?
		coordinator.coordinate(readingItemAt: url, options: [], error: &coordinationError) { coordinatedURL in
			result = Result {
				try readData(at: coordinatedURL, fileName: fileName)
			}
		}
		if coordinationError != nil {
			throw MarkdownImportFileError.unreadableFile(fileName)
		}
		guard let result else {
			throw MarkdownImportFileError.unreadableFile(fileName)
		}
		return try result.get()
	}

	nonisolated private static func readData(at url: URL, fileName: String) throws -> Data {
		let handle = try FileHandle(forReadingFrom: url)
		defer { try? handle.close() }
		var data = Data()
		while let chunk = try handle.read(upToCount: readChunkSize), !chunk.isEmpty {
			try Task.checkCancellation()
			guard data.count + chunk.count <= maximumFileBytes else {
				throw MarkdownImportFileError.fileTooLarge(
					fileName,
					maximumBytes: maximumFileBytes
				)
			}
			data.append(chunk)
		}
		return data
	}

	nonisolated private static func title(from fileName: String) -> String {
		let baseName = (fileName as NSString).deletingPathExtension
		let title = baseName
			.replacingOccurrences(
				of: "[-_]+",
				with: " ",
				options: .regularExpression
			)
			.trimmingCharacters(in: .whitespacesAndNewlines)
		return title.isEmpty ? "Untitled document" : title
	}
}
