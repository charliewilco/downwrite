import Foundation
import Observation

@Observable
final class WorkspaceCreatorViewModel: Identifiable {
    static let defaultAccentColor = "#ff4fb8"

    let id = UUID()
    var name = ""
    var description = ""
    var accentColor = defaultAccentColor
    var isSaving = false
    var statusMessage: String?

    private let session: SessionViewModel

    init(session: SessionViewModel) {
        self.session = session
    }

    var canCreate: Bool {
        !isSaving
    }

    func create() async -> GroupSummary? {
		guard !isSaving else {
			return nil
		}
        guard let activeSession = session.activeSession else {
            statusMessage = URLError(.userAuthenticationRequired).localizedDescription
            return nil
        }
        isSaving = true
        statusMessage = nil
        defer { isSaving = false }

        do {
            return try await activeSession.apiClient.createGroup(
                name: name.nilIfBlank ?? "Untitled workspace",
                description: description.nilIfBlank,
                accentColor: accentColor.nilIfBlank ?? Self.defaultAccentColor
            )
        } catch {
            statusMessage = error.localizedDescription
            return nil
        }
    }
}

private extension String {
    var nilIfBlank: String? {
        let value = trimmingCharacters(in: .whitespacesAndNewlines)
        return value.isEmpty ? nil : value
    }
}
