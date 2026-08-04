import type { ComponentChildren, JSX } from "preact";

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

export function renderMarkdown(markdown: string): JSX.Element[] {
  return parseMarkdown(markdown).map((block, index) => {
    if (block.type === "heading") {
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
      return <Tag key={index}>{renderInline(block.value)}</Tag>;
    }

    if (block.type === "ul") {
      return (
        <ul key={index}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    }

    if (block.type === "code") {
      return (
        <pre key={index}>
          <code>{block.value}</code>
        </pre>
      );
    }

    if (block.type === "quote") {
      return <blockquote key={index}>{renderInline(block.value)}</blockquote>;
    }

    return <p key={index}>{renderInline(block.value)}</p>;
  });
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

function renderInline(text: string): ComponentChildren[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|_[^_]+_)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("_") && part.endsWith("_")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}
