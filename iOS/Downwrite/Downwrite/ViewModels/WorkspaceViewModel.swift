import Foundation
import Observation

@Observable
final class WorkspaceViewModel {
    var groupsState: LoadState<[GroupSummary]> = .idle
    var selectedGroupID: String?
    var selectedDocumentID: String?
    var workspaceCreator: WorkspaceCreatorViewModel?
    var documentCreator: DocumentCreatorViewModel?
    var groupEditor: GroupEditorViewModel?
    var groupReassignment: GroupReassignmentViewModel?
	var markdownImporter: MarkdownImportViewModel?
	var markdownImportFailure: MarkdownImportFailure?
	var isSelectingMarkdownFiles = false

    let session: SessionViewModel
	private var groupsRequestID = 0
	private var markdownImportWorkspace: GroupSummary?

    init(session: SessionViewModel) {
        self.session = session
        if let firstGroup = session.activeSession?.previewGroups.first {
            groupsState = .loaded(session.activeSession?.previewGroups ?? [])
            selectedGroupID = firstGroup.id
            selectedDocumentID = firstGroup.documents.first?.id
        }
    }

    var groups: [GroupSummary] {
        guard case .loaded(let groups) = groupsState else {
            return []
        }
        return groups
    }

    var selectedGroup: GroupSummary? {
        groups.first { $0.id == selectedGroupID }
    }

    var selectedDocument: DocumentSummary? {
        selectedGroup?.documents.first { $0.id == selectedDocumentID }
    }

    func createWorkspace() {
        workspaceCreator = WorkspaceCreatorViewModel(session: session)
    }

    func applyCreatedWorkspace(_ workspace: GroupSummary) {
		groupsRequestID += 1
        groupsState = .loaded([workspace] + groups.filter { $0.id != workspace.id })
        selectedGroupID = workspace.id
        selectedDocumentID = nil
        workspaceCreator = nil
    }

    func loadGroups() async {
		groupsRequestID += 1
		let requestID = groupsRequestID
        guard let activeSession = session.activeSession else {
            groupsState = .failed("Sign in before loading groups.")
            return
        }
        if case .loaded = groupsState {
		}
		else {
            groupsState = .loading
        }

        do {
            let list = try await activeSession.apiClient.listGroups(limit: 100, cursor: nil)
			guard requestID == groupsRequestID else {
				return
			}
            groupsState = .loaded(list.groups)
			let selectedGroup = list.groups.first { $0.id == selectedGroupID } ?? list.groups.first
			selectedGroupID = selectedGroup?.id
			selectedDocumentID =
				selectedGroup?.documents.first { $0.id == selectedDocumentID }?.id
				?? selectedGroup?.documents.first?.id
            }
		catch {
			guard requestID == groupsRequestID else {
				return
			}
            groupsState = .failed(error.localizedDescription)
        }
    }

    func editSelectedGroup() {
        guard let group = selectedGroup else {
            return
        }
        groupEditor = GroupEditorViewModel(group: group, session: session)
    }

    func createDocument(in group: GroupSummary) {
        documentCreator = DocumentCreatorViewModel(group: group, session: session)
    }

	func selectMarkdownFiles(in group: GroupSummary) {
		markdownImportWorkspace = group
		isSelectingMarkdownFiles = true
	}

	func handleMarkdownFileSelection(_ result: Result<[URL], Error>) {
		defer { markdownImportWorkspace = nil }
		guard let workspace = markdownImportWorkspace else {
			return
		}
		switch result {
		case .success(let urls):
			guard !urls.isEmpty else {
				return
			}
			markdownImporter = MarkdownImportViewModel(
				urls: urls,
				workspace: workspace,
				session: session
			)
		case .failure(let error):
			markdownImportFailure = MarkdownImportFailure(message: error.localizedDescription)
		}
	}

    func applyCreatedDocument(_ document: DocumentRecord) {
        guard var group = groups.first(where: { $0.id == document.groupId }) else {
            return
        }
        group.documents.append(document.summary)
        replace(group)
        selectedGroupID = group.id
        selectedDocumentID = document.id
    }

	func applyImportedDocuments(_ documents: [DocumentRecord]) {
		guard !documents.isEmpty, let groupID = documents.last?.groupId,
			var group = groups.first(where: { $0.id == groupID })
		else {
			return
		}
		groupsRequestID += 1
		for document in documents {
			group.documents.removeAll { $0.id == document.id }
			group.documents.append(document.summary)
		}
		group.documents.sort { lhs, rhs in
			if lhs.position == rhs.position {
				return lhs.updatedAt > rhs.updatedAt
			}
			return lhs.position < rhs.position
		}
		replace(group)
		selectedGroupID = group.id
		selectedDocumentID = documents.last?.id
	}

	func applyUpdatedDocument(_ document: DocumentRecord) {
		guard var group = groups.first(where: { $0.id == document.groupId }),
			let documentIndex = group.documents.firstIndex(where: { $0.id == document.id })
		else {
			return
		}
		group.documents[documentIndex] = document.summary
		replace(group)
	}

	func applyMovedDocument(_ document: DocumentRecord, from sourceGroupID: String) {
		groupsRequestID += 1
		var nextGroups = groups
		if let sourceIndex = nextGroups.firstIndex(where: { $0.id == sourceGroupID }) {
			nextGroups[sourceIndex].documents.removeAll { $0.id == document.id }
		}
		guard let targetIndex = nextGroups.firstIndex(where: { $0.id == document.groupId }) else {
			groupsState = .loaded(nextGroups)
			return
		}
		nextGroups[targetIndex].documents.removeAll { $0.id == document.id }
		nextGroups[targetIndex].documents.append(document.summary)
		nextGroups[targetIndex].documents.sort { lhs, rhs in
			if lhs.position == rhs.position {
				return lhs.updatedAt > rhs.updatedAt
			}
			return lhs.position < rhs.position
		}
		groupsState = .loaded(nextGroups)
		selectedGroupID = document.groupId
		selectedDocumentID = document.id
	}

	func applyDeletedDocument(_ document: DocumentRecord) {
		let wasSelected = selectedDocumentID == document.id
		guard var group = groups.first(where: { $0.id == document.groupId }),
			let deletedIndex = group.documents.firstIndex(where: { $0.id == document.id })
		else {
			return
		}
		group.documents.remove(at: deletedIndex)
		let adjacentDocumentID =
			group.documents.indices.contains(deletedIndex)
			? group.documents[deletedIndex].id
			: group.documents.last?.id
		replace(group)
		guard wasSelected else {
			return
		}
		selectedGroupID = group.id
		selectedDocumentID = adjacentDocumentID
	}

    func reassignAndRemoveSelectedGroup() {
        guard let group = selectedGroup else {
            return
        }
        groupReassignment = GroupReassignmentViewModel(sourceGroup: group, groups: groups, session: session)
    }

    func applyEditedGroup(_ group: GroupSummary) {
        replace(group)
    }

    func removeGroup(_ groupID: String, replacementGroup: GroupSummary?) {
		groupsRequestID += 1
        var nextGroups = groups.filter { $0.id != groupID }
        if let replacementGroup, !nextGroups.contains(where: { $0.id == replacementGroup.id }) {
            nextGroups.append(replacementGroup)
        }
        groupsState = .loaded(nextGroups)
        selectedGroupID = replacementGroup?.id ?? nextGroups.first?.id
        selectedDocumentID = replacementGroup?.documents.first?.id ?? nextGroups.first?.documents.first?.id
    }

    func replace(_ group: GroupSummary) {
		groupsRequestID += 1
        var nextGroups = groups
        if let index = nextGroups.firstIndex(where: { $0.id == group.id }) {
            nextGroups[index] = group
		}
		else {
            nextGroups.append(group)
        }
        groupsState = .loaded(nextGroups)
    }
}

extension InstanceSession {
	fileprivate var previewGroups: [GroupSummary] {
        guard let client = apiClient as? PreviewDownwriteAPIClient else {
            return []
        }
        return client.groups
    }
}
