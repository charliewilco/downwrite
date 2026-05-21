import SwiftUI

struct StacksListView: View {
	let model: AppModel

	var body: some View {
		List(selection: Bindable(model).selectedStackID) {
			ForEach(model.stacks) { stack in
				VStack(alignment: .leading, spacing: 4) {
					Text(stack.name)
						.font(.headline)
					Text("\(stack.documentCount) documents")
						.font(.caption)
						.foregroundStyle(.secondary)
				}
				.tag(stack.id)
			}
		}
		.overlay {
			if model.isLoadingStacks {
				ProgressView()
			} else if model.stacks.isEmpty {
				ContentUnavailableView("No stacks", systemImage: "square.stack.3d.up")
			}
		}
		.navigationTitle("Stacks")
		.toolbar {
			ToolbarItem(placement: .topBarLeading) {
				Button {
					Task {
						await model.signOut()
					}
				} label: {
					Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
				}
			}
			ToolbarItem(placement: .topBarTrailing) {
				Button {
					Task {
						await model.loadStacks()
					}
				} label: {
					Label("Refresh", systemImage: "arrow.clockwise")
				}
			}
		}
		.task {
			await model.loadStacks()
		}
		.onChange(of: model.selectedStackID) { _, stackID in
			guard let stackID else {
				return
			}
			Task {
				await model.loadStack(stackID: stackID)
			}
		}
	}
}

#Preview {
	NavigationStack {
		StacksListView(model: .previewSignedIn)
	}
}
