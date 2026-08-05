import SwiftUI

struct ContentView: View {
    @State private var appModel: AppViewModel

    init(appModel: AppViewModel = AppViewModel()) {
        _appModel = State(initialValue: appModel)
    }

    var body: some View {
        Group {
            switch appModel.session.state {
            case .signedOut:
                LoginView(viewModel: LoginViewModel(session: appModel.session))
            case .signedIn:
                WorkspaceShellView(viewModel: appModel.workspaceModel)
            }
        }
        .tint(.primary)
    }
}

#Preview("Signed out") {
    ContentView(appModel: .previewSignedOut)
}

#Preview("Workspace") {
    ContentView(appModel: .previewSignedIn)
}
