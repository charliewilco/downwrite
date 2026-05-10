import { marked } from "marked";

export function renderMarkdown(content: string): { html: string; text: string } {
	const html = marked.parse(content, { async: false }) as string;
	const text = html
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	return { html, text };
}
