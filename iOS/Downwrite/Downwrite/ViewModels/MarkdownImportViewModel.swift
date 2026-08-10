import Foundation
import Observation

@Observable
final class MarkdownImportViewModel: Identifiable {
	let id = UUID()
	let workspace: GroupSummary
	var filesState: LoadState<[MarkdownImportFile]> = .idle
	var importedDocuments: [DocumentRecord] = []
	var isImporting = false
	var isOutcomeUncertain = false
	var statusMessage: String?

	private let sourceURLs: [URL]
	private let session: SessionViewModel
	private var nextFileIndex = 0
	private var loadRevision = 0

	init(urls: [URL], workspace: GroupSummary, session: SessionViewModel) {
		sourceURLs = urls
		self.workspace = workspace
		self.session = session
	}

	var files: [MarkdownImportFile] {
		guard case .loaded(let files) = filesState else {
			return []
		}
		return files
	}

	var remainingCount: Int {
		max(0, files.count - nextFileIndex)
	}

	var isComplete: Bool {
		!files.isEmpty && nextFileIndex == files.count
	}

	var canImport: Bool {
		!isImporting && !isOutcomeUncertain && remainingCount > 0
	}

	func loadFiles() async {
		loadRevision += 1
		let revision = loadRevision
		filesState = .loading
		statusMessage = nil
		do {
			let files = try await MarkdownImportFileLoader.loadFiles(from: sourceURLs)
			guard revision == loadRevision else {
				return
			}
			filesState = .loaded(files)
		}
		catch is CancellationError {
			return
		}
		catch {
			guard revision == loadRevision else {
				return
			}
			filesState = .failed(error.localizedDescription)
		}
	}

	func importRemainingFiles() async -> [DocumentRecord] {
		guard canImport, let apiClient = session.activeSession?.apiClient else {
			return []
		}
		isImporting = true
		statusMessage = nil
		let initialImportedCount = importedDocuments.count
		defer { isImporting = false }

		while nextFileIndex < files.count {
			guard !Task.isCancelled else {
				statusMessage = progressMessage(prefix: "Import paused.")
				break
			}
			let file = files[nextFileIndex]
			do {
				let document = try await apiClient.createDocument(
					groupId: workspace.id,
					title: file.title,
					content: file.content
				)
				importedDocuments.append(document)
				nextFileIndex += 1
			}
			catch {
				if isAmbiguous(error) {
					isOutcomeUncertain = true
					statusMessage = progressMessage(
						prefix: "The result for \(file.fileName) could not be confirmed. Close and refresh before importing it again."
					)
				}
				else {
					statusMessage = progressMessage(prefix: error.localizedDescription)
				}
				break
			}
		}

		if isComplete {
			statusMessage = "Imported \(importedDocuments.count) document\(importedDocuments.count == 1 ? "" : "s")."
		}
		return Array(importedDocuments.dropFirst(initialImportedCount))
	}

	private func progressMessage(prefix: String) -> String {
		guard !importedDocuments.isEmpty else {
			return prefix
		}
		return "\(prefix) \(importedDocuments.count) of \(files.count) documents imported."
	}

	private func isAmbiguous(_ error: Error) -> Bool {
		guard let apiError = error as? DownwriteErrorEnvelope else {
			return true
		}
		return apiError.status >= 500
	}
}
