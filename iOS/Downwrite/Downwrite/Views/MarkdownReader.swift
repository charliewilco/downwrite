import SwiftUI

struct MarkdownReader: View {
    let markdown: String

    private var attributed: AttributedString {
        (try? AttributedString(markdown: markdown, options: AttributedString.MarkdownParsingOptions(interpretedSyntax: .inlineOnlyPreservingWhitespace))) ?? AttributedString(markdown)
    }

    var body: some View {
        ScrollView {
            Text(attributed)
                .font(.system(.body, design: .serif))
                .fontWidth(.standard)
                .lineSpacing(7)
                .textSelection(.enabled)
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
