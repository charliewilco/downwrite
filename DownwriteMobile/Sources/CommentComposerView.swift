import SwiftUI

struct CommentComposerView: View {
	let model: AppModel
	@Environment(\.dismiss) private var dismiss
	@State private var quote = ""
	@State private var comment = ""

	var body: some View {
		NavigationStack {
			Form {
				Section("Quote") {
					TextField("Paste the exact text to comment on", text: $quote, axis: .vertical)
						.lineLimit(3...6)
				}

				Section("Comment") {
					TextField("Write a comment", text: $comment, axis: .vertical)
						.lineLimit(4...8)
				}
			}
			.navigationTitle("New Comment")
			.toolbar {
				ToolbarItem(placement: .cancellationAction) {
					Button("Cancel") {
						dismiss()
					}
				}
				ToolbarItem(placement: .confirmationAction) {
					Button("Post") {
						Task {
							await model.createAnnotation(quote: quote, comment: comment)
							dismiss()
						}
					}
					.disabled(quote.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || comment.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
				}
			}
		}
	}
}

#Preview {
	CommentComposerView(model: .previewSignedIn)
}
