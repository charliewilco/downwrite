import SwiftUI

struct ContentView: View {
    @State private var appModel: AppViewModel

    init(appModel: AppViewModel = AppViewModel()) {
        _appModel = State(initialValue: appModel)
    }

    var body: some View {
        Group {
            switch appModel.session.state {
			case .restoring:
				ProgressView("Restoring session")
            case .signedOut:
                LoginView(viewModel: LoginViewModel(session: appModel.session))
			case .signedIn(let session):
				WorkspaceContainerView(session: appModel.session)
					.id(session.id)
            }
        }
        .tint(.primary)
		.task {
			appModel.session.restore()
		}
    }
}

#Preview("Signed out") {
    ContentView(appModel: .previewSignedOut)
}

#Preview("Workspace") {
    ContentView(appModel: .previewSignedIn)
}
