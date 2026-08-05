import Foundation
import Observation

@Observable
final class WorkspaceViewModel {
    var groupsState: LoadState<[GroupSummary]> = .idle
    var selectedGroupID: String?
    var selectedDocumentID: String?
    var groupEditor: GroupEditorViewModel?
    var groupReassignment: GroupReassignmentViewModel?

    let session: SessionViewModel

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

    func loadGroups() async {
        guard let activeSession = session.activeSession else {
            groupsState = .failed("Sign in before loading groups.")
            return
        }
        if case .loaded = groupsState {
        } else {
            groupsState = .loading
        }

        do {
            let list = try await activeSession.apiClient.listGroups(limit: 100, cursor: nil)
            groupsState = .loaded(list.groups)
            selectedGroupID = selectedGroupID ?? list.groups.first?.id
            if selectedDocumentID == nil {
                selectedDocumentID = list.groups.first?.documents.first?.id
            }
        } catch {
            groupsState = .failed(error.localizedDescription)
        }
    }

    func editSelectedGroup() {
        guard let group = selectedGroup else {
            return
        }
        groupEditor = GroupEditorViewModel(group: group, session: session)
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
        var nextGroups = groups.filter { $0.id != groupID }
        if let replacementGroup, !nextGroups.contains(where: { $0.id == replacementGroup.id }) {
            nextGroups.append(replacementGroup)
        }
        groupsState = .loaded(nextGroups)
        selectedGroupID = replacementGroup?.id ?? nextGroups.first?.id
        selectedDocumentID = replacementGroup?.documents.first?.id ?? nextGroups.first?.documents.first?.id
    }

    func replace(_ group: GroupSummary) {
        var nextGroups = groups
        if let index = nextGroups.firstIndex(where: { $0.id == group.id }) {
            nextGroups[index] = group
        } else {
            nextGroups.append(group)
        }
        groupsState = .loaded(nextGroups)
    }
}

private extension InstanceSession {
    var previewGroups: [GroupSummary] {
        guard let client = apiClient as? PreviewDownwriteAPIClient else {
            return []
        }
        return client.groups
    }
}
