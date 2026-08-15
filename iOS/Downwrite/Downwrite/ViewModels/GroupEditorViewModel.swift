import Foundation
import Observation

@Observable
final class GroupEditorViewModel: Identifiable {
    let id: String
    var name: String
    var description: String
    var accentColor: String
    var isSaving = false
    var statusMessage: String?

    private let group: GroupSummary
    private let session: SessionViewModel

    init(group: GroupSummary, session: SessionViewModel) {
        self.id = group.id
        self.group = group
        self.session = session
        self.name = group.name
        self.description = group.description ?? ""
        self.accentColor = group.accentColor ?? ""
    }

    func save() async throws -> GroupSummary {
        guard let activeSession = session.activeSession else {
            throw URLError(.userAuthenticationRequired)
        }
        isSaving = true
        defer { isSaving = false }

        let updated = try await activeSession.apiClient.updateGroup(
            id: group.id,
            name: name,
            description: description.nilIfBlank,
            accentColor: accentColor.nilIfBlank
        )
        return updated
    }
}

private extension String {
    var nilIfBlank: String? {
        let value = trimmingCharacters(in: .whitespacesAndNewlines)
        return value.isEmpty ? nil : value
    }
}
