import * as Draft from "draft-js";
import "markdown-draft-js";

declare module "markdown-draft-js" {
  export interface MarkdownDraftOptions {
    preserveNewlines?: boolean;
    entityItems?: any;
  }

  function markdownToDraft(
    s: string,
    options: MarkdownDraftOptions
  ): Draft.RawDraftContentState;

  function draftToMarkdown(
    d: Draft.RawDraftContentState,
    options: MarkdownDraftOptions
  ): string;
}
