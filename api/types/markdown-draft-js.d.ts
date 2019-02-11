declare module "markdown-draft-js" {
  export interface MarkdownDraftOptions {
    preserveNewlines?: boolean;
    entityItems?: any;
  }

  export function markdownToDraft(
    s: string,
    options?: MarkdownDraftOptions
  ): Draft.RawDraftContentState;

  export function draftToMarkdown(
    d: Draft.RawDraftContentState,
    options?: MarkdownDraftOptions
  ): string;
}
