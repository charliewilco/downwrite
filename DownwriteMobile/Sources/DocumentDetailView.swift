import SwiftUI

struct DocumentDetailView: View {
	let model: AppModel
	@State private var isShowingCommentComposer = false

	var body: some View {
		Group {
			if model.isLoadingDocument {
				ProgressView()
			} else if let detail = model.documentDetail {
				ScrollView {
					VStack(alignment: .leading, spacing: 24) {
						VStack(alignment: .leading, spacing: 8) {
							Text(detail.document.title)
								.font(.largeTitle.bold())
							Text("Version \(detail.version.versionNumber)")
								.font(.subheadline)
								.foregroundStyle(.secondary)
						}

						Text(detail.version.contentMarkdown)
							.font(.body)
							.textSelection(.enabled)

						Divider()

						AnnotationsListView(model: model)
					}
					.frame(maxWidth: 760, alignment: .leading)
					.padding(24)
				}
				.navigationTitle(detail.document.title)
				.toolbar {
					ToolbarItem(placement: .topBarTrailing) {
						Button {
							isShowingCommentComposer = true
						} label: {
							Label("Comment", systemImage: "text.bubble")
						}
					}
				}
				.sheet(isPresented: $isShowingCommentComposer) {
					CommentComposerView(model: model)
				}
			} else {
				ContentUnavailableView("Select a document", systemImage: "doc.text.magnifyingglass")
			}
		}
		.task(id: model.selectedDocumentID) {
			guard let documentID = model.selectedDocumentID else {
				return
			}
			await model.loadDocument(documentID: documentID)
		}
	}
}

#Preview {
	NavigationStack {
		DocumentDetailView(model: .previewSignedIn)
	}
}
