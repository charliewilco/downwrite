import SwiftUI

struct RootView: View {
	let model: AppModel

	var body: some View {
		Group {
			if model.isRestoringSession {
				ProgressView("Opening Downwrite")
			} else if model.session == nil {
				LoginView(model: model)
			} else {
				WorkspaceView(model: model)
			}
		}
		.task {
			await model.restoreSavedSession()
		}
	}
}

#Preview {
	RootView(model: .previewSignedIn)
}
