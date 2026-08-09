import CryptoKit
import Foundation

struct DocumentDraftKey: Codable, Equatable {
	let instanceURL: String
	let identityID: String
	let documentID: String

	var storageIdentifier: String {
		"\(instanceURL)\n\(identityID)\n\(documentID)"
	}
}

struct StoredDocumentDraft: Codable, Equatable {
	let key: DocumentDraftKey
	let baseline: DocumentRecord
	let title: String
	let content: String
}

final class DocumentDraftStore {
	static let shared = DocumentDraftStore()

	private let directoryURL: URL
	private let fileManager: FileManager
	private let encoder = JSONEncoder()
	private let decoder = JSONDecoder()

	init(directoryURL: URL? = nil, fileManager: FileManager = .default) {
		self.fileManager = fileManager
		self.directoryURL = directoryURL
			?? fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
			.appending(path: "Downwrite/Drafts", directoryHint: .isDirectory)
	}

	func load(for key: DocumentDraftKey) throws -> StoredDocumentDraft? {
		let fileURL = fileURL(for: key)
		guard fileManager.fileExists(atPath: fileURL.path) else {
			return nil
		}
		return try decoder.decode(StoredDocumentDraft.self, from: Data(contentsOf: fileURL))
	}

	func save(_ draft: StoredDocumentDraft) throws {
		try fileManager.createDirectory(at: directoryURL, withIntermediateDirectories: true)
		try encoder.encode(draft).write(to: fileURL(for: draft.key), options: .atomic)
	}

	func remove(for key: DocumentDraftKey) throws {
		let fileURL = fileURL(for: key)
		guard fileManager.fileExists(atPath: fileURL.path) else {
			return
		}
		try fileManager.removeItem(at: fileURL)
	}

	func removeAll(instanceURL: URL) throws {
		guard fileManager.fileExists(atPath: directoryURL.path) else {
			return
		}
		for fileURL in try fileManager.contentsOfDirectory(
			at: directoryURL,
			includingPropertiesForKeys: nil,
			options: .skipsHiddenFiles
		) {
			guard let data = try? Data(contentsOf: fileURL),
				let draft = try? decoder.decode(StoredDocumentDraft.self, from: data),
				draft.key.instanceURL == instanceURL.absoluteString
			else {
				continue
			}
			try fileManager.removeItem(at: fileURL)
		}
	}

	private func fileURL(for key: DocumentDraftKey) -> URL {
		let digest = SHA256.hash(data: Data(key.storageIdentifier.utf8))
		let filename = digest.map { String(format: "%02x", $0) }.joined()
		return directoryURL.appending(path: "\(filename).json", directoryHint: .notDirectory)
	}
}
