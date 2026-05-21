import Foundation
import Testing
@testable import DownwriteMobile

struct DownwriteMobileTests {
	@Test
	func normalizesInstanceURLsWithoutScheme() throws {
		let url = try normalizedInstanceURL("downwrite.example.com")
		#expect(url.absoluteString == "https://downwrite.example.com")
	}

	@Test
	func buildsInstanceScopedAPIURL() throws {
		let url = try #require(URL(string: "https://downwrite.example.com/root"))
		let apiURL = makeURL(instanceURL: url, apiBase: "/v1", endpoint: "stacks")
		#expect(apiURL.absoluteString == "https://downwrite.example.com/root/v1/stacks")
	}

	@Test
	func decodesSnakeCaseAuthPayload() throws {
		let json = """
		{
			"session": {"token": "signed", "expires_at": "2026-05-20T12:00:00Z"},
			"user": {"id": "user-1", "name": "Charlie", "email": "charlie@example.com", "created_at": "2026-05-20T12:00:00Z"},
			"workspaces": [{"id": "workspace-1", "name": "Charlie workspace", "slug": "charlie", "created_by": "user-1", "created_at": "2026-05-20T12:00:00Z"}],
			"default_workspace_id": "workspace-1"
		}
		""".data(using: .utf8)!

		let response = try JSONDecoder.downwrite.decode(AuthResponse.self, from: json)

		#expect(response.session.token == "signed")
		#expect(response.defaultWorkspaceID == "workspace-1")
		#expect(response.workspaces.first?.createdBy == "user-1")
	}

	@Test
	func decodesInstanceValidationPayload() throws {
		let json = """
		{
			"valid": true,
			"name": "Downwrite",
			"api_version": "v1",
			"features": ["password_auth", "stacks", "documents", "annotations"]
		}
		""".data(using: .utf8)!

		let response = try JSONDecoder.downwrite.decode(InstanceValidationResponse.self, from: json)

		#expect(response.valid)
		#expect(response.name == "Downwrite")
		#expect(response.apiVersion == "v1")
		#expect(response.features.contains("annotations"))
	}

	@Test
	func decodesStackDetailPayload() throws {
		let json = """
		{
			"stack": {
				"id": "stack-1",
				"workspace_id": "workspace-1",
				"name": "Product notes",
				"slug": "product-notes",
				"public": false,
				"created_by": "user-1",
				"created_at": "2026-05-20T12:00:00Z",
				"updated_at": "2026-05-20T12:00:00Z"
			},
			"documents": [{
				"id": "doc-1",
				"workspace_id": "workspace-1",
				"stack_id": "stack-1",
				"title": "SwiftUI client",
				"slug": "swiftui-client",
				"status": "active",
				"public": false,
				"created_by": "user-1",
				"latest_version_id": "version-1",
				"stack_position": 0,
				"color": "sky",
				"theme": "sans-serif",
				"created_at": "2026-05-20T12:00:00Z",
				"updated_at": "2026-05-20T12:00:00Z",
				"version_number": 1,
				"excerpt": "Native reader"
			}]
		}
		""".data(using: .utf8)!

		let response = try JSONDecoder.downwrite.decode(StackDetail.self, from: json)

		#expect(response.stack.id == "stack-1")
		#expect(response.documents.first?.title == "SwiftUI client")
	}

	@Test
	func calculatesAnnotationBoundsForExactQuote() {
		let bounds = annotationBounds(for: "native client", in: "A small native client for Downwrite.")

		#expect(bounds.start == 8)
		#expect(bounds.end == 21)
		#expect(bounds.prefix == "A small ")
		#expect(bounds.suffix == " for Downwrite.")
	}
}
