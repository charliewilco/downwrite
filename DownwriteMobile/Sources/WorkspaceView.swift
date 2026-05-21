import SwiftUI

struct WorkspaceView: View {
	let model: AppModel

	var body: some View {
		NavigationSplitView {
			StacksListView(model: model)
		} content: {
			StackDetailView(model: model)
		} detail: {
			DocumentDetailView(model: model)
		}
		.alert("Downwrite", isPresented: hasErrorMessage) {
			Button("OK") {
				model.errorMessage = nil
			}
		} message: {
			Text(model.errorMessage ?? "")
		}
	}

	private var hasErrorMessage: Binding<Bool> {
		Binding {
			model.errorMessage != nil
		} set: { isPresented in
			if isPresented == false {
				model.errorMessage = nil
			}
		}
	}
}

#Preview {
	WorkspaceView(model: .previewSignedIn)
}
