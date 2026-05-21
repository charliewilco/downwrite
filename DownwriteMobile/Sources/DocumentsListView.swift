import SwiftUI

struct DocumentsListView: View {
	let model: AppModel

	var body: some View {
		List(selection: Bindable(model).selectedDocumentID) {
			ForEach(model.documents) { document in
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
		.overlay {
			if model.isLoadingDocuments {
				ProgressView()
			} else if model.documents.isEmpty {
				ContentUnavailableView("No documents", systemImage: "doc.text")
			}
		}
		.navigationTitle("Documents")
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
		DocumentsListView(model: .previewSignedIn)
	}
}
