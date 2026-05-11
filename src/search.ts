import { createHash } from "node:crypto";

export const embeddingDimensions = 32;

export type ChunkDraft = {
	content: string;
	chunkIndex: number;
	tokenCount: number;
};

export type SearchResult = {
	document_id: string;
	document_title: string;
	document_slug: string;
	version_id: string;
	version_number: number;
	chunk_id: string;
	chunk_index: number;
	chunk_count: number;
	snippet: string;
	lexical_score: number;
	semantic_score: number;
	combined_score: number;
	provenance: {
		workspace_id: string;
		document_id: string;
		document_version_id: string;
		chunk_id: string;
	};
	search_text?: string;
	embedding?: number[];
};

export function chunkMarkdown(content: string): ChunkDraft[] {
	const segments = content
		.replace(/\r\n?/g, "\n")
		.split("\n\n")
		.map((part) => part.trim())
		.filter(Boolean);
	const chunks: ChunkDraft[] = [];
	let current = "";

	const appendChunk = () => {
		const text = current.trim();
		if (!text) {
			current = "";
			return;
		}
		chunks.push({
			content: text,
			chunkIndex: chunks.length,
			tokenCount: tokenizeSearchText(text).length,
		});
		current = "";
	};

	for (const segment of segments) {
		if (!current) {
			current = segment;
			continue;
		}

		if (
			current.length + 2 + segment.length > 900 ||
			startsStructuredBlock(segment)
		) {
			appendChunk();
			current = segment;
			continue;
		}

		current += `\n\n${segment}`;
	}
	appendChunk();

	const fallback = content.trim();
	return chunks.length > 0 || !fallback
		? chunks
		: [
				{
					content: fallback,
					chunkIndex: 0,
					tokenCount: tokenizeSearchText(fallback).length,
				},
			];
}

export function searchTextForChunk(content: string): string {
	return tokenizeSearchText(content).join(" ");
}

export function deterministicEmbedding(text: string): number[] {
	const vector = Array.from({ length: embeddingDimensions }, () => 0);
	for (const token of tokenizeSearchText(text)) {
		const hash = createHash("sha256").update(token).digest();
		const index = hash.readUInt32BE(0) % embeddingDimensions;
		vector[index] += 1;
	}

	const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
	return norm === 0 ? vector : vector.map((value) => value / norm);
}

export function vectorLiteral(values: number[]): string {
	return `[${values.map((value) => (Number.isFinite(value) ? String(value) : "0")).join(",")}]`;
}

export function parseVectorLiteral(value: string): number[] {
	const trimmed = value.trim().replace(/^\[/, "").replace(/\]$/, "");
	if (!trimmed) {
		return [];
	}
	return trimmed.split(",").map((part) => Number.parseFloat(part.trim()));
}

export function rankSemanticResults(
	query: string,
	candidates: SearchResult[],
	limit: number,
): SearchResult[] {
	const queryEmbedding = deterministicEmbedding(query);
	return candidates
		.map((candidate) => ({
			...candidate,
			semantic_score: cosineSimilarity(
				queryEmbedding,
				candidate.embedding ?? [],
			),
			snippet: snippetForResult(candidate.snippet, query),
		}))
		.filter((candidate) => candidate.semantic_score >= 0.2)
		.sort(
			(a, b) =>
				b.semantic_score - a.semantic_score ||
				a.chunk_id.localeCompare(b.chunk_id),
		)
		.slice(0, limit);
}

export function reciprocalRankFusion(
	lexical: SearchResult[],
	semantic: SearchResult[],
	limit: number,
): SearchResult[] {
	const merged = new Map<string, SearchResult>();
	const apply = (results: SearchResult[], source: "lexical" | "semantic") => {
		results.forEach((result, index) => {
			const existing = merged.get(result.chunk_id) ?? {
				...result,
				combined_score: 0,
			};
			existing.combined_score += 1 / (60 + index + 1);
			if (source === "lexical") {
				existing.lexical_score = Math.max(
					existing.lexical_score,
					result.lexical_score,
				);
			} else {
				existing.semantic_score = Math.max(
					existing.semantic_score,
					result.semantic_score,
				);
			}
			if (!existing.snippet) {
				existing.snippet = result.snippet;
			}
			merged.set(result.chunk_id, existing);
		});
	};

	apply(lexical, "lexical");
	apply(semantic, "semantic");
	return [...merged.values()]
		.sort(
			(a, b) =>
				b.combined_score - a.combined_score ||
				b.lexical_score - a.lexical_score ||
				b.semantic_score - a.semantic_score,
		)
		.slice(0, limit);
}

export function snippetForResult(content: string, query: string): string {
	const trimmed = content.trim();
	if (!trimmed) {
		return "";
	}

	const lower = trimmed.toLowerCase();
	for (const token of tokenizeSearchText(query)) {
		const index = lower.indexOf(token);
		if (index >= 0) {
			return trimmed
				.slice(
					Math.max(index - 60, 0),
					Math.min(index + token.length + 120, trimmed.length),
				)
				.trim();
		}
	}

	return trimmed.length <= 220 ? trimmed : `${trimmed.slice(0, 220).trim()}...`;
}

function tokenizeSearchText(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9 ]+/g, " ")
		.split(/\s+/)
		.filter(Boolean);
}

function startsStructuredBlock(segment: string): boolean {
	return (
		segment.startsWith("#") ||
		segment.startsWith(">") ||
		segment.startsWith("```") ||
		segment.startsWith("- ") ||
		segment.startsWith("* ") ||
		segment.startsWith("1. ")
	);
}

function cosineSimilarity(a: number[], b: number[]): number {
	if (a.length === 0 || a.length !== b.length) {
		return 0;
	}
	return a.reduce((sum, value, index) => sum + value * b[index], 0);
}
