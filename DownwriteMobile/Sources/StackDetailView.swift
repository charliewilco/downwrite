import SwiftUI

struct StackDetailView: View {
	let model: AppModel

	var body: some View {
		List(selection: Bindable(model).selectedDocumentID) {
			if let detail = model.stackDetail {
				Section {
					VStack(alignment: .leading, spacing: 10) {
						Text(detail.stack.name)
							.font(.title2.bold())
						Text(detail.stack.slug)
							.font(.subheadline)
							.foregroundStyle(.secondary)
						HStack(spacing: 12) {
							Label("\(detail.documents.count) documents", systemImage: "doc.text")
							Label(detail.stack.isPublic ? "Public" : "Private", systemImage: detail.stack.isPublic ? "globe" : "lock")
						}
						.font(.caption)
						.foregroundStyle(.secondary)
					}
					.padding(.vertical, 4)
				}

				Section("Documents") {
					ForEach(detail.documents) { document in
						VStack(alignment: .leading, spacing: 6) {
							Text(document.title)
								.font(.headline)
							Text(document.excerpt)
								.font(.subheadline)
								.foregroundStyle(.secondary)
								.lineLimit(3)
						}
						.tag(document.id)
					}
				}
			}
		}
		.overlay {
			if model.isLoadingDocuments {
				ProgressView()
			} else if model.stackDetail == nil {
				ContentUnavailableView("Select a stack", systemImage: "square.stack.3d.up")
			} else if model.documents.isEmpty {
				ContentUnavailableView("No documents", systemImage: "doc.text")
			}
		}
		.navigationTitle("Stack")
		.onChange(of: model.selectedDocumentID) { _, documentID in
			guard let documentID else {
				return
			}
			Task {
				await model.loadDocument(documentID: documentID)
			}
		}
	}
}

#Preview {
	NavigationStack {
		StackDetailView(model: .previewSignedIn)
	}
}
