import assert from "node:assert/strict";
import test from "node:test";
import { createMarkdownManager } from "../src/client/tiptap-extensions.mjs";

const fixtures = [
  {
    name: "basic blocks and inline marks",
    markdown: `# Launch note

This is **bold**, _italic_, ~~struck~~, and \`inline code\`.

> A blockquote with [a link](https://example.com).`,
  },
  {
    name: "ordered and unordered lists",
    markdown: `1. First
2. Second

- Alpha
- Beta
  - Nested beta`,
  },
  {
    name: "fenced code block",
    markdown: `## Code

\`\`\`ts
const message = "Downwrite";
console.log(message);
\`\`\``,
  },
  {
    name: "gfm task list",
    markdown: `- [x] Keep Markdown canonical
- [ ] Validate rich editing
- [ ] Ship web first`,
  },
];

test("Tiptap Markdown manager preserves supported Markdown structures", () => {
  const markdown = createMarkdownManager();

  for (const fixture of fixtures) {
    const parsed = markdown.parse(fixture.markdown);
    const serialized = markdown.serialize(parsed);
    const reparsed = markdown.parse(serialized);

    assert.deepEqual(
      reparsed,
      parsed,
      `${fixture.name} should round-trip semantically`,
    );
  }
});
