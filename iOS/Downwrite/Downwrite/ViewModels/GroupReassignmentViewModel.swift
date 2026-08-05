import Foundation
import Observation

@Observable
final class GroupReassignmentViewModel: Identifiable {
    let id: String
    let sourceGroup: GroupSummary
    let candidateGroups: [GroupSummary]
    var targetGroupID: String
    var isWorking = false
    var statusMessage: String?

    private let session: SessionViewModel

    init(sourceGroup: GroupSummary, groups: [GroupSummary], session: SessionViewModel) {
        self.id = sourceGroup.id
        self.sourceGroup = sourceGroup
        self.candidateGroups = groups.filter { $0.id != sourceGroup.id }
        self.targetGroupID = candidateGroups.first?.id ?? ""
        self.session = session
    }

    var targetGroup: GroupSummary? {
        candidateGroups.first { $0.id == targetGroupID }
    }

    var canSubmit: Bool {
        !sourceGroup.documents.isEmpty && targetGroup != nil
    }

    func reassignAndDelete() async throws -> GroupSummary {
        guard let activeSession = session.activeSession, let targetGroup else {
            throw URLError(.userAuthenticationRequired)
        }
        isWorking = true
        defer { isWorking = false }

        var movedDocuments = targetGroup.documents
        for document in sourceGroup.documents {
            let moved = try await activeSession.apiClient.moveDocument(
                id: document.id,
                groupId: targetGroup.id,
                position: nil,
                baseRevision: document.revision
            )
            movedDocuments.append(moved.summary)
        }
        try await activeSession.apiClient.deleteGroup(id: sourceGroup.id)
        var updatedTarget = targetGroup
        updatedTarget.documents = movedDocuments.sorted { lhs, rhs in
            if lhs.position == rhs.position {
                return lhs.updatedAt > rhs.updatedAt
            }
            return lhs.position < rhs.position
        }
        return updatedTarget
    }
}
