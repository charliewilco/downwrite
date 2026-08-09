import DownwriteAPI
import Foundation
import Testing

@testable import Downwrite

@MainActor
struct DownwriteTests {
    @Test func generatedDiscoveryMetadataMapsToAppModel() throws {
        let discovery = Components.Schemas.Discovery(
            name: "downwrite",
			instanceUrl: "http://localhost:8787",
			api: .init(
				currentVersion: "v1",
				supportedVersions: ["v1"],
				baseUrl: "http://localhost:8787/api/v1",
				basePath: "/api/v1",
				discoveryUrl: "http://localhost:8787/.well-known/downwrite",
				openApiUrl: "http://localhost:8787/api/v1/openapi.json",
				documentationUrl: "http://localhost:8787/api/v1/docs"
			),
			auth: .init(),
			clients: .init()
        )

        let metadata = discovery.appModel

        #expect(metadata.name == "downwrite")
		#expect(metadata.instanceURL == "http://localhost:8787")
		#expect(metadata.supportedAPIVersions == ["v1"])
		#expect(metadata.apiBaseURL == "http://localhost:8787/api/v1")
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

    @Test func workspaceLoadWithoutSessionShowsFailure() async throws {
        let viewModel = WorkspaceViewModel(session: .previewSignedOut)

        await viewModel.loadGroups()

        guard case .failed(let message) = viewModel.groupsState else {
            Issue.record("Expected failed group loading state.")
            return
        }
        #expect(message == "Sign in before loading groups.")
    }

    @Test func workspaceLoadSurfacesClientFailure() async throws {
        let client = PreviewDownwriteAPIClient.sampleCopy()
        client.listGroupsError = DownwriteErrorEnvelope(error: "Groups are unavailable", code: "unavailable", status: 503)
        let viewModel = WorkspaceViewModel(session: .signedIn(client: client))

        await viewModel.loadGroups()

        guard case .failed(let message) = viewModel.groupsState else {
            Issue.record("Expected failed group loading state.")
            return
        }
        #expect(message == "Groups are unavailable")
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

    @Test func documentCreationAddsAndSelectsDocument() async throws {
        let client = PreviewDownwriteAPIClient.sampleCopy()
        let session = SessionViewModel.signedIn(client: client)
        let workspace = WorkspaceViewModel(session: session)
        let group = try #require(workspace.groups.first)
        let creator = DocumentCreatorViewModel(group: group, session: session)
        creator.title = "  New outline  "
        creator.content = "# New outline"

        let document = try await creator.create()
        workspace.applyCreatedDocument(document)

        #expect(document.title == "New outline")
        #expect(workspace.selectedGroupID == group.id)
        #expect(workspace.selectedDocumentID == document.id)
        #expect(workspace.selectedGroup?.documents.contains { $0.id == document.id } == true)
    }

    @Test func documentCreationRequiresTitle() async throws {
        let client = PreviewDownwriteAPIClient.sampleCopy()
        let session = SessionViewModel.signedIn(client: client)
        let group = try #require(client.groups.first)
        let creator = DocumentCreatorViewModel(group: group, session: session)

        #expect(creator.canCreate == false)

        creator.title = "Draft"

        #expect(creator.canCreate == true)
    }

    @Test func documentLoadSurfacesMissingDocumentFailure() async throws {
        let client = PreviewDownwriteAPIClient.sampleCopy()
        client.getDocumentError = DownwriteErrorEnvelope(error: "Document was not found", code: "not_found", status: 404)
        let viewModel = DocumentViewModel(documentID: "doc-missing", session: .signedIn(client: client))

        await viewModel.load()

        guard case .failed(let message) = viewModel.documentState else {
            Issue.record("Expected failed document loading state.")
            return
        }
        #expect(message == "Document was not found")
    }

    @Test func documentConflictKeepsDraftDirty() async throws {
        let client = PreviewDownwriteAPIClient.sampleCopy()
        let viewModel = DocumentViewModel(documentID: "doc-pitch", session: .signedIn(client: client))

        await viewModel.load()
        client.documents["doc-pitch"]?.revision += 1
        viewModel.draftContent += "\n\nLocal draft."
        await viewModel.save()

        #expect(viewModel.document?.revision == 7)
        #expect(viewModel.hasChanges == true)
        #expect(viewModel.statusMessage == "Document has changed since it was loaded")
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

        let result = try await viewModel.reassignAndDelete()
        let target = try #require(result.replacementGroup)

        #expect(target.id == "group-archive")
        #expect(target.documents.contains { $0.id == "doc-pitch" })
        #expect(client.groups.contains { $0.id == "group-product" } == false)
    }

    @Test func emptyGroupRemovalDoesNotRequireReassignmentTarget() async throws {
        let emptyGroup = GroupSummary(
            id: "group-empty",
            name: "Empty",
            description: nil,
            accentColor: nil,
            role: .owner,
            createdAt: PreviewDownwriteAPIClient.timestamp,
            updatedAt: PreviewDownwriteAPIClient.timestamp,
            documents: []
        )
        let client = PreviewDownwriteAPIClient(groups: [emptyGroup], documents: [:])
        let viewModel = GroupReassignmentViewModel(sourceGroup: emptyGroup, groups: client.groups, session: .signedIn(client: client))

        #expect(viewModel.canSubmit == true)

        let result = try await viewModel.reassignAndDelete()

        #expect(result.removedGroupID == "group-empty")
        #expect(result.replacementGroup == nil)
        #expect(client.groups.isEmpty)
    }
}

extension PreviewDownwriteAPIClient {
	fileprivate static func sampleCopy() -> PreviewDownwriteAPIClient {
        PreviewDownwriteAPIClient(groups: sample.groups, documents: sample.documents)
    }
}

extension SessionViewModel {
    @MainActor
	fileprivate static func signedIn(client: PreviewDownwriteAPIClient) -> SessionViewModel {
        SessionViewModel(
            state: .signedIn(
                InstanceSession(
                    instanceURL: client.baseURL,
                    identity: Identity(id: "local-owner"),
                    apiClient: client
                )
            )
        )
    }
}
