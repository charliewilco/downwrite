import type { AnyExtension } from "@tiptap/core";
import type { MarkdownManager } from "@tiptap/markdown";

export function createMarkdownExtensions(options?: {
  placeholder?: string;
}): AnyExtension[];

export function createMarkdownManager(): MarkdownManager;
