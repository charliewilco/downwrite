import SwiftUI

struct DocumentSaveStatusView: View {
	let state: DocumentSaveState

	var body: some View {
		if let presentation {
			Label(presentation.message, systemImage: presentation.systemImage)
				.font(.footnote)
				.foregroundStyle(presentation.color)
				.frame(maxWidth: .infinity, alignment: .leading)
				.padding(.horizontal)
				.padding(.vertical, 8)
				.background(.thinMaterial)
		}
	}

	private var presentation: Presentation? {
		switch state {
		case .ready:
			return nil
		case .dirty:
			return Presentation(message: "Unsaved changes", systemImage: "circle", color: .secondary)
		case .saving:
			return Presentation(message: "Saving…", systemImage: "arrow.trianglehead.2.clockwise", color: .secondary)
		case .saved(let revision):
			return Presentation(message: "Saved revision \(revision)", systemImage: "checkmark.circle", color: .secondary)
		case .failed(let message):
			return Presentation(message: "Save failed: \(message)", systemImage: "exclamationmark.triangle", color: .red)
		case .conflict(let message):
			return Presentation(message: message, systemImage: "arrow.triangle.branch", color: .orange)
		}
	}
}

private extension DocumentSaveStatusView {
	struct Presentation {
		let message: String
		let systemImage: String
		let color: Color
	}
}

#Preview("Dirty") {
	DocumentSaveStatusView(state: .dirty)
}

#Preview("Saving") {
	DocumentSaveStatusView(state: .saving)
}

#Preview("Saved") {
	DocumentSaveStatusView(state: .saved(revision: 3))
}

#Preview("Failed") {
	DocumentSaveStatusView(state: .failed(message: "The network connection was lost."))
}

#Preview("Conflict") {
	DocumentSaveStatusView(
		state: .conflict(message: "Document changed elsewhere. Your edits are preserved; save again to replace the latest revision.")
	)
}
