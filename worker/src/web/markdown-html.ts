interface ListBlock {
  type: "ul";
  items: string[];
}

interface CodeBlock {
  type: "code";
  value: string;
}

interface QuoteBlock {
  type: "quote";
  value: string;
}

interface HeadingBlock {
  type: "heading";
  level: 1 | 2 | 3;
  value: string;
}

interface ParagraphBlock {
  type: "paragraph";
  value: string;
}

type MarkdownBlock =
  ListBlock | CodeBlock | QuoteBlock | HeadingBlock | ParagraphBlock;

export function renderMarkdownHtml(markdown: string) {
  return parseMarkdown(markdown)
    .map((block) => {
      if (block.type === "heading") {
        return `<h${block.level}>${renderInline(block.value)}</h${block.level}>`;
      }

      if (block.type === "ul") {
        return `<ul>${block.items
          .map((item) => `<li>${renderInline(item)}</li>`)
          .join("")}</ul>`;
      }

      if (block.type === "code") {
        return `<pre><code>${escapeHtml(block.value)}</code></pre>`;
      }

      if (block.type === "quote") {
        return `<blockquote>${renderInline(block.value)}</blockquote>`;
      }

      return `<p>${renderInline(block.value)}</p>`;
    })
    .join("");
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] | null = null;

  function flushParagraph() {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", value: paragraph.join(" ") });
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length > 0) {
      blocks.push({ type: "ul", items: list });
      list = [];
    }
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (code) {
        blocks.push({ type: "code", value: code.join("\n") });
        code = null;
      } else {
        flushParagraph();
        flushList();
        code = [];
      }
      continue;
    }

    if (code) {
      code.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3,
        value: heading[2],
      });
      continue;
    }

    const listItem = /^[-*]\s+(.+)$/.exec(trimmed);
    if (listItem) {
      flushParagraph();
      list.push(listItem[1]);
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "quote", value: trimmed.replace(/^>\s?/, "") });
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  if (code) {
    blocks.push({ type: "code", value: code.join("\n") });
  }

  return blocks;
}

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|_[^_]+_)/g);

  return parts
    .map((part) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      }

      if (part.startsWith("**") && part.endsWith("**")) {
        return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`;
      }

      if (part.startsWith("_") && part.endsWith("_")) {
        return `<em>${escapeHtml(part.slice(1, -1))}</em>`;
      }

      return escapeHtml(part);
    })
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
