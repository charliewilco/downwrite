import { draftjsToMd } from "draftjs-md-converter";

export function createMarkdownServer(
	content: Draft.RawDraftContentState | string
): string {
	if (typeof content === "string") {
		return content;
	}

	if (content === undefined) {
		return "";
	}
	return draftjsToMd(content);
}
