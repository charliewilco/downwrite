import Foundation
import Testing

@testable import Downwrite

@MainActor
struct WorkspaceCreatorTests {
    @Test func createsWorkspaceUsingAstroDefaults() async throws {
        let client = PreviewDownwriteAPIClient(groups: [], documents: [:])
        let creator = WorkspaceCreatorViewModel(session: .signedIn(client: client))
        creator.name = "   "
        creator.description = "  "
        creator.accentColor = ""

        let result = await creator.create()
        let workspace = try #require(result)

        #expect(workspace.name == "Untitled workspace")
        #expect(workspace.description == nil)
        #expect(workspace.accentColor == "#ff4fb8")
        #expect(client.groups == [workspace])
    }

    @Test func createsWorkspaceUsingTrimmedValues() async throws {
        let client = PreviewDownwriteAPIClient(groups: [], documents: [:])
        let creator = WorkspaceCreatorViewModel(session: .signedIn(client: client))
        creator.name = "  Field Notes  "
        creator.description = "  Research and interviews  "
        creator.accentColor = "  #34dfff  "

        let result = await creator.create()
        let workspace = try #require(result)

        #expect(workspace.name == "Field Notes")
        #expect(workspace.description == "Research and interviews")
        #expect(workspace.accentColor == "#34dfff")
    }

    @Test func appliesCreatedWorkspaceByPrependingAndSelectingIt() throws {
        let client = PreviewDownwriteAPIClient.sampleCopy()
        let workspaceViewModel = WorkspaceViewModel(session: .signedIn(client: client))
        let existingCount = workspaceViewModel.groups.count
        let workspace = GroupSummary(
            id: "workspace-new",
            name: "New workspace",
            description: nil,
            accentColor: "#ff4fb8",
            role: .owner,
            createdAt: PreviewDownwriteAPIClient.timestamp,
            updatedAt: PreviewDownwriteAPIClient.timestamp,
            documents: []
        )

        workspaceViewModel.applyCreatedWorkspace(workspace)
        workspaceViewModel.applyCreatedWorkspace(workspace)

        #expect(workspaceViewModel.groups.count == existingCount + 1)
        #expect(workspaceViewModel.groups.first == workspace)
        #expect(workspaceViewModel.selectedGroupID == workspace.id)
        #expect(workspaceViewModel.selectedDocumentID == nil)
        #expect(workspaceViewModel.workspaceCreator == nil)
    }

    @Test func failurePreservesInputAndClearsBusyState() async throws {
        let client = PreviewDownwriteAPIClient(groups: [], documents: [:])
        client.createGroupError = DownwriteErrorEnvelope(
            error: "Workspace could not be created",
            code: "unavailable",
            status: 503
        )
		let workspaceViewModel = WorkspaceViewModel(session: .signedIn(client: client))
		workspaceViewModel.createWorkspace()
		let creator = try #require(workspaceViewModel.workspaceCreator)
        creator.name = "Field Notes"

        let workspace = await creator.create()

        #expect(workspace == nil)
        #expect(creator.name == "Field Notes")
        #expect(creator.isSaving == false)
        #expect(creator.statusMessage == "Workspace could not be created")
		#expect(workspaceViewModel.workspaceCreator === creator)
    }

	@Test func rapidCreateIsSingleFlight() async throws {
		let client = PreviewDownwriteAPIClient(groups: [], documents: [:])
		client.createGroupDelay = .milliseconds(50)
		let creator = WorkspaceCreatorViewModel(session: .signedIn(client: client))
		creator.name = "Field Notes"

		let firstCreate = Task { await creator.create() }
		while !creator.isSaving {
			await Task.yield()
		}
		let secondWorkspace = await creator.create()
		let firstWorkspace = await firstCreate.value

		#expect(firstWorkspace != nil)
		#expect(secondWorkspace == nil)
		#expect(client.createGroupCallCount == 1)
		#expect(client.groups.count == 1)
	}

	@Test func staleLoadCannotReplaceCreatedWorkspace() async throws {
		let client = PreviewDownwriteAPIClient(groups: [], documents: [:])
		client.listGroupsDelay = .milliseconds(50)
		let workspaceViewModel = WorkspaceViewModel(session: .signedIn(client: client))
		let load = Task { await workspaceViewModel.loadGroups() }
		while true {
			if case .loading = workspaceViewModel.groupsState {
				break
			}
			await Task.yield()
		}
		let creator = WorkspaceCreatorViewModel(session: workspaceViewModel.session)
		creator.name = "Field Notes"
		let workspace = try #require(await creator.create())

		workspaceViewModel.applyCreatedWorkspace(workspace)
		await load.value

		#expect(workspaceViewModel.groups == [workspace])
		#expect(workspaceViewModel.selectedGroupID == workspace.id)
	}
}

private extension PreviewDownwriteAPIClient {
    static func sampleCopy() -> PreviewDownwriteAPIClient {
        PreviewDownwriteAPIClient(groups: sample.groups, documents: sample.documents)
    }
}

private extension SessionViewModel {
    @MainActor
    static func signedIn(client: PreviewDownwriteAPIClient) -> SessionViewModel {
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
