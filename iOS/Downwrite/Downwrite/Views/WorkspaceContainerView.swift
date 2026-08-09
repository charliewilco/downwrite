import SwiftUI

struct WorkspaceContainerView: View {
    @State private var viewModel: WorkspaceViewModel

    init(session: SessionViewModel) {
        _viewModel = State(initialValue: WorkspaceViewModel(session: session))
    }

    var body: some View {
        WorkspaceShellView(viewModel: viewModel)
    }
}

#Preview {
    WorkspaceContainerView(session: .previewSignedIn)
}
