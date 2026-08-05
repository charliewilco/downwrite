import SwiftUI
import Textual

struct MarkdownReader: View {
    let markdown: String

    var body: some View {
        ScrollView {
            StructuredText(markdown: markdown)
                .font(.system(.body, design: .serif))
                .textual.structuredTextStyle(.gitHub)
                .textual.textSelection(.enabled)
                .frame(maxWidth: 720, alignment: .leading)
                .padding(.horizontal, 24)
                .padding(.vertical, 32)
                .frame(maxWidth: .infinity, alignment: .center)
        }
        .background(Color(.systemGroupedBackground))
    }
}

#Preview("Markdown reader") {
    MarkdownReader(markdown: PreviewDownwriteAPIClient.sample.documents["doc-pitch"]!.content)
}
