import DownwriteAPI
import Foundation
import Testing

struct GeneratedDocumentDecodingTests {
	@Test func decodesFlattenedDocumentRecord() throws {
		let data = Data(
			##"{"document":{"id":"doc-1","groupId":"group-1","title":"Launch Narrative","content":"# Launch","role":"owner","position":1000,"revision":2,"createdAt":"2026-08-09T00:00:00.000Z","updatedAt":"2026-08-09T00:00:00.000Z"}}"##.utf8
		)

		let envelope = try JSONDecoder().decode(
			Components.Schemas.DocumentEnvelope.self,
			from: data
		)

		#expect(envelope.document.id == "doc-1")
		#expect(envelope.document.content == "# Launch")
	}

	@Test func decodesFlattenedDocumentVersionRecord() throws {
		let data = Data(
			##"{"id":"version-1","documentId":"doc-1","name":"Before edits","description":null,"sourceRevision":2,"title":"Launch Narrative","createdByIdentityId":"owner-1","createdAt":"2026-08-09T00:00:00.000Z","content":"# Launch"}"##.utf8
		)

		let version = try JSONDecoder().decode(
			Components.Schemas.DocumentVersionRecord.self,
			from: data
		)

		#expect(version.id == "version-1")
		#expect(version.content == "# Launch")
	}
}
