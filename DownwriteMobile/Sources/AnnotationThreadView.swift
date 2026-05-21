import SwiftUI

struct AnnotationThreadView: View {
	let model: AppModel
	let thread: AnnotationThread
	@State private var replyBody = ""

	var body: some View {
		VStack(alignment: .leading, spacing: 12) {
			Text(thread.annotation.quote)
				.font(.callout)
				.padding(10)
				.background(.quaternary, in: RoundedRectangle(cornerRadius: 8))

			Text(thread.annotation.comment)
				.font(.body)

			ForEach(thread.comments) { comment in
				Text(comment.body)
					.font(.subheadline)
					.foregroundStyle(.secondary)
					.padding(.leading, 12)
			}

			HStack {
				TextField("Reply", text: $replyBody, axis: .vertical)
					.textFieldStyle(.roundedBorder)
				Button {
					let body = replyBody
					replyBody = ""
					Task {
						await model.reply(to: thread.annotation.id, body: body)
					}
				} label: {
					Label("Reply", systemImage: "arrowshape.turn.up.left.fill")
				}
				.disabled(replyBody.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
			}
		}
		.padding(14)
		.background(.background, in: RoundedRectangle(cornerRadius: 8))
		.overlay {
			RoundedRectangle(cornerRadius: 8)
				.stroke(.quaternary)
		}
	}
}

#Preview {
	AnnotationThreadView(model: .previewSignedIn, thread: PreviewFixtures.annotationThread)
		.padding()
}
