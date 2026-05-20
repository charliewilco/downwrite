import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	chunkMarkdown,
	deterministicEmbedding,
	parseVectorLiteral,
	rankSemanticResults,
	vectorLiteral,
} from "./search.js";

describe("search helpers", () => {
	it("chunks markdown at structured boundaries", () => {
		const chunks = chunkMarkdown("# alpha\n\nbeta paragraph\n\n- gamma");

		assert.equal(chunks.length, 2);
		assert.equal(chunks[1]?.chunkIndex, 1);
		assert.ok((chunks[1]?.tokenCount ?? 0) > 0);
	});

	it("round-trips pgvector literals", () => {
		const embedding = deterministicEmbedding("markdown sharing system");
		const parsed = parseVectorLiteral(vectorLiteral(embedding));

		assert.equal(parsed.length, embedding.length);
		assert.deepEqual(parsed, embedding);
	});

	it("ranks semantically similar candidates", () => {
		const [result] = rankSemanticResults(
			"markdown sharing",
			[
				{
					document_id: "doc-1",
					document_title: "Doc",
					document_slug: "doc",
					version_id: "version-1",
					version_number: 1,
					chunk_id: "chunk-1",
					chunk_index: 0,
					chunk_count: 1,
					snippet: "markdown sharing system",
					lexical_score: 0,
					semantic_score: 0,
					combined_score: 0,
					provenance: {
						workspace_id: "workspace-1",
						document_id: "doc-1",
						document_version_id: "version-1",
						chunk_id: "chunk-1",
					},
					embedding: deterministicEmbedding("markdown sharing system"),
				},
			],
			1,
		);

		assert.equal(result?.chunk_id, "chunk-1");
		assert.ok((result?.semantic_score ?? 0) > 0.2);
	});
});
