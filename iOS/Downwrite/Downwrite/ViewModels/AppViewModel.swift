import Foundation
import Observation

@Observable
final class AppViewModel {
    let session: SessionViewModel
    let workspaceModel: WorkspaceViewModel

    init(session: SessionViewModel = SessionViewModel()) {
        self.session = session
        self.workspaceModel = WorkspaceViewModel(session: session)
    }
}

extension AppViewModel {
    static let previewSignedOut = AppViewModel(session: .previewSignedOut)
    static let previewSignedIn = AppViewModel(session: .previewSignedIn)
}
