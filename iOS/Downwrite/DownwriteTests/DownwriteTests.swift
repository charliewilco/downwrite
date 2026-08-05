import Foundation
import Testing
@testable import Downwrite

@MainActor
struct DownwriteTests {
    @Test func discoveryMetadataDecodesLooseOpenAPIObjects() throws {
        let data = """
        {
          "name": "downwrite",
          "instanceUrl": "http://localhost:8787",
          "api": { "baseUrl": "http://localhost:8787/api/v1" },
          "auth": { "current": "oauth" },
          "clients": { "ios": { "clientId": "downwrite-ios" } }
        }
        """.data(using: .utf8)!

        let metadata = try JSONDecoder().decode(DiscoveryMetadata.self, from: data)

        #expect(metadata.name == "downwrite")
        #expect(metadata.api?.storage["baseUrl"] == .string("http://localhost:8787/api/v1"))
    }

    @Test func workspaceLoadsGroupsFromSessionClient() async throws {
        let session = SessionViewModel(
            state: .signedIn(
                InstanceSession(
                    instanceURL: URL(string: "http://localhost:8787")!,
                    identity: Identity(id: "local-owner"),
                    apiClient: PreviewDownwriteAPIClient.sampleCopy()
                )
            )
        )
        let viewModel = WorkspaceViewModel(session: session)

        await viewModel.loadGroups()

        #expect(viewModel.groups.count == 2)
        #expect(viewModel.selectedGroupID == "group-product")
    }

    @Test func documentSaveUsesCurrentRevision() async throws {
        let session = SessionViewModel(
            state: .signedIn(
                InstanceSession(
                    instanceURL: URL(string: "http://localhost:8787")!,
                    identity: Identity(id: "local-owner"),
                    apiClient: PreviewDownwriteAPIClient.sampleCopy()
                )
            )
        )
        let viewModel = DocumentViewModel(documentID: "doc-pitch", session: session)

        await viewModel.load()
        viewModel.draftContent += "\n\nSaved from a test."
        await viewModel.save()

        #expect(viewModel.document?.revision == 8)
        #expect(viewModel.hasChanges == false)
    }

    @Test func groupRemovalMovesDocumentsBeforeDeletingSourceGroup() async throws {
        let client = PreviewDownwriteAPIClient.sampleCopy()
        let session = SessionViewModel(
            state: .signedIn(
                InstanceSession(
                    instanceURL: URL(string: "http://localhost:8787")!,
                    identity: Identity(id: "local-owner"),
                    apiClient: client
                )
            )
        )
        let source = client.groups.first { $0.id == "group-product" }!
        let viewModel = GroupReassignmentViewModel(sourceGroup: source, groups: client.groups, session: session)
        viewModel.targetGroupID = "group-archive"

        let target = try await viewModel.reassignAndDelete()

        #expect(target.id == "group-archive")
        #expect(target.documents.contains { $0.id == "doc-pitch" })
        #expect(client.groups.contains { $0.id == "group-product" } == false)
    }
}

private extension PreviewDownwriteAPIClient {
    static func sampleCopy() -> PreviewDownwriteAPIClient {
        PreviewDownwriteAPIClient(groups: sample.groups, documents: sample.documents)
    }
}
