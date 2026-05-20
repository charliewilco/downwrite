import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildTextDiff } from "./diff.js";

describe("buildTextDiff", () => {
	it("produces side-by-side line rows and summary counts", () => {
		const diff = buildTextDiff(
			"alpha\nbeta\ngamma",
			"alpha\nbravo\ngamma\ndelta",
		);

		assert.deepEqual(diff.summary, {
			inserted: 2,
			deleted: 1,
			unchanged: 2,
		});
		assert.deepEqual(diff.rows[0], {
			kind: "unchanged",
			left_number: 1,
			right_number: 1,
			left_text: "alpha",
			right_text: "alpha",
		});
	});
});
