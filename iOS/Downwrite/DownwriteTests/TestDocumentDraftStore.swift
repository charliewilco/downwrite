import Foundation

@testable import Downwrite

extension DocumentDraftStore {
	static func testStore() -> DocumentDraftStore {
		DocumentDraftStore(
			directoryURL: FileManager.default.temporaryDirectory
				.appending(path: "DownwriteTests/\(UUID().uuidString)", directoryHint: .isDirectory)
		)
	}
}
