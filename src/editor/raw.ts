import { RawDraftContentState } from "draft-js";
import cuid from "cuid";

export const fixRawContentState = (raw: RawDraftContentState) => {
	let keyCache: Record<string, string> = {};

	const clone = Object.assign({}, raw);

	clone.blocks = raw.blocks.map((n) => {
		let key = !!keyCache[n.key] ? n.key : cuid();
		return {
			...n,
			key
		};
	});

	return clone;
};
