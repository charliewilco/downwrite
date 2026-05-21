import SwiftUI

struct AnnotationsListView: View {
	let model: AppModel

	var body: some View {
		VStack(alignment: .leading, spacing: 16) {
			Text("Comments")
				.font(.title2.bold())

			if model.annotations.isEmpty {
				ContentUnavailableView("No comments yet", systemImage: "text.bubble")
					.frame(maxWidth: .infinity)
			} else {
				ForEach(model.annotations) { thread in
					AnnotationThreadView(model: model, thread: thread)
				}
			}
		}
	}
}

#Preview {
	AnnotationsListView(model: .previewSignedIn)
		.padding()
}
