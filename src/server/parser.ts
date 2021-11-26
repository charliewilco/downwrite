import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

export const toSafeHTML = async (content: string) => {
  const file = await unified()
    .use(remarkParse)
    .use(require("remark-prism"))
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content);

  return String(file);
};
