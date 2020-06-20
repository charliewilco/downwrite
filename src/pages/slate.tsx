import * as React from "react";
import Prism from "prismjs";

// Import the Slate editor factory.
import { Text, createEditor, Node } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { css } from "emotion";

// @ts-ignore
// eslint-disable-next-line
Prism.languages.markdown=Prism.languages.extend("markup",{}),Prism.languages.insertBefore("markdown","prolog",{blockquote:{pattern:/^>(?:[\t ]*>)*/m,alias:"punctuation"},code:[{pattern:/^(?: {4}|\t).+/m,alias:"keyword"},{pattern:/``.+?``|`[^`\n]+`/,alias:"keyword"}],title:[{pattern:/\w+.*(?:\r?\n|\r)(?:==+|--+)/,alias:"important",inside:{punctuation:/==+$|--+$/}},{pattern:/(^\s*)#+.+/m,lookbehind:!0,alias:"important",inside:{punctuation:/^#+|#+$/}}],hr:{pattern:/(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,lookbehind:!0,alias:"punctuation"},list:{pattern:/(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,lookbehind:!0,alias:"punctuation"},"url-reference":{pattern:/!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,inside:{variable:{pattern:/^(!?\[)[^\]]+/,lookbehind:!0},string:/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,punctuation:/^[\[\]!:]|[<>]/},alias:"url"},bold:{pattern:/(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^\*\*|^__|\*\*$|__$/}},italic:{pattern:/(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^[*_]|[*_]$/}},url:{pattern:/!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,inside:{variable:{pattern:/(!?\[)[^\]]+(?=\]$)/,lookbehind:!0},string:{pattern:/"(?:\\.|[^"\\])*"(?=\)$)/}}}}),Prism.languages.markdown.bold.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.italic.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.bold.inside.italic=Prism.util.clone(Prism.languages.markdown.italic),Prism.languages.markdown.italic.inside.bold=Prism.util.clone(Prism.languages.markdown.bold); // prettier-ignore

type Token = string | Prism.Token;

export default function SlateEditor() {
  const editor = React.useMemo(() => withHistory(withReact(createEditor())), []);
  const renderLeaf = React.useCallback(props => <Leaf {...props} />, []);

  const decorate = React.useCallback(([node, path]) => {
    const ranges: any[] = [];

    if (!Text.isText(node)) {
      return ranges;
    }

    const getLength = (token: Token | Token[]): number => {
      if (typeof token === "string") {
        return token.length;
      } else if (typeof token.content === "string") {
        return token.content.length;
      } else {
        return (token.content as Prism.Token[]).reduce<number>(
          (l: number, t: any) => l + getLength(t),
          0
        );
      }
    };

    const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
    let start = 0;

    for (const token of tokens) {
      const length = getLength(token);
      const end = start + length;

      if (typeof token !== "string") {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end }
        });
      }

      start = end;
    }

    return ranges;
  }, []);

  const [value, setValue] = React.useState<Node[]>([
    { type: "paragraph", children: [{ text: "A line of text in a paragraph." }] },
    { type: "paragraph", children: [{ text: "## Gay" }] },
    { type: "paragraph", children: [{ text: "## Bisexual" }] },
    { type: "paragraph", children: [{ text: "" }] },
    { type: "paragraph", children: [{ text: "## Hello" }] },
    { type: "paragraph", children: [{ text: "" }] },
    { type: "paragraph", children: [{ text: "`something`" }] },
    { type: "paragraph", children: [{ text: "" }] }
  ]);

  return (
    <div>
      <h1>Hello</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: 16
        }}>
        <Slate editor={editor} value={value} onChange={value => setValue(value)}>
          <Editable
            decorate={decorate}
            renderLeaf={renderLeaf}
            placeholder="Write some markdown..."
          />
        </Slate>

        <pre
          style={{
            fontSize: "small"
          }}>
          <code>{JSON.stringify({ value }, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}

const Leaf = ({ attributes, children, leaf }: any) => {
  const style: React.CSSProperties = Object.assign(
    {},
    {
      fontWeight: leaf.bold && "bold",
      fontSize: leaf.italic && "italic",
      textDecoration: leaf.underlined && "underline"
    },
    leaf.title && {
      display: "inline-block",
      fontWeight: 700,
      fontSize: 20,
      marginTop: 20,
      marginBottom: 10
    }
  );

  return (
    <span
      {...attributes}
      style={style}
      className={css`
        ${leaf.title &&
          css`
            display: inline-block;
            font-weight: bold;
            font-size: 20px;
            margin: 20px 0 10px 0;
          `}
        ${leaf.list &&
          css`
            padding-left: 10px;
            font-size: 20px;
            line-height: 10px;
          `}
        ${leaf.hr &&
          css`
            display: block;
            text-align: center;
            border-bottom: 2px solid #ddd;
          `}
        ${leaf.blockquote &&
          css`
            display: inline-block;
            border-left: 2px solid #ddd;
            padding-left: 10px;
            color: #aaa;
            font-style: italic;
          `}
        ${leaf.code &&
          css`
            font-family: monospace;
            background-color: #eee;
            padding: 3px;
          `}
      `}>
      {children}
    </span>
  );
};
