import { Markdown, MarkdownManager } from "@tiptap/markdown";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { StarterKit } from "@tiptap/starter-kit";

const markdownOptions = {
  markedOptions: {
    gfm: true,
    breaks: false,
    pedantic: false,
  },
};

export function createMarkdownExtensions(options = {}) {
  return [
    StarterKit.configure({
      link: false,
    }),
    Link.configure({
      autolink: true,
      linkOnPaste: true,
      openOnClick: false,
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Placeholder.configure({
      placeholder: options.placeholder ?? "Start writing...",
    }),
    Markdown.configure(markdownOptions),
  ];
}

export function createMarkdownManager() {
  return new MarkdownManager({
    ...markdownOptions,
    extensions: createMarkdownExtensions(),
  });
}
