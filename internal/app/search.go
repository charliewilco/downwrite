package app

import (
	"hash/fnv"
	"math"
	"sort"
	"strings"
	"unicode"
)

const (
	embeddingDimensions = 32
	maxChunkRunes       = 900
	rrfK                = 60.0
)

type ChunkDraft struct {
	Content    string
	ChunkIndex int
	TokenCount int
}

type Embedder interface {
	Embed(text string) []float64
}

type DeterministicEmbedder struct{}

func (DeterministicEmbedder) Embed(text string) []float64 {
	return deterministicEmbedding(text)
}

func chunkMarkdown(content string) []ChunkDraft {
	segments := splitChunkSegments(content)
	chunks := make([]ChunkDraft, 0, len(segments))

	var current strings.Builder
	appendChunk := func() {
		text := strings.TrimSpace(current.String())
		if text == "" {
			current.Reset()
			return
		}

		chunks = append(chunks, ChunkDraft{
			Content:    text,
			ChunkIndex: len(chunks),
			TokenCount: len(tokenizeSearchText(text)),
		})
		current.Reset()
	}

	for _, segment := range segments {
		segment = strings.TrimSpace(segment)
		if segment == "" {
			continue
		}

		if current.Len() == 0 {
			current.WriteString(segment)
			continue
		}

		if current.Len()+2+len(segment) > maxChunkRunes || startsStructuredBlock(segment) {
			appendChunk()
			current.WriteString(segment)
			continue
		}

		current.WriteString("\n\n")
		current.WriteString(segment)
	}

	appendChunk()

	if len(chunks) == 0 {
		text := strings.TrimSpace(content)
		if text == "" {
			return nil
		}

		return []ChunkDraft{{
			Content:    text,
			ChunkIndex: 0,
			TokenCount: len(tokenizeSearchText(text)),
		}}
	}

	return chunks
}

func splitChunkSegments(content string) []string {
	replacer := strings.NewReplacer("\r\n", "\n", "\r", "\n")
	normalized := replacer.Replace(content)
	parts := strings.Split(normalized, "\n\n")
	segments := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed == "" {
			continue
		}
		segments = append(segments, trimmed)
	}
	return segments
}

func startsStructuredBlock(segment string) bool {
	switch {
	case strings.HasPrefix(segment, "#"),
		strings.HasPrefix(segment, ">"),
		strings.HasPrefix(segment, "```"),
		strings.HasPrefix(segment, "- "),
		strings.HasPrefix(segment, "* "),
		strings.HasPrefix(segment, "1. "):
		return true
	default:
		return false
	}
}

func tokenizeSearchText(text string) []string {
	var builder strings.Builder
	builder.Grow(len(text))
	for _, r := range strings.ToLower(text) {
		if unicode.IsLetter(r) || unicode.IsNumber(r) || r == ' ' {
			builder.WriteRune(r)
			continue
		}
		builder.WriteRune(' ')
	}

	return strings.Fields(builder.String())
}

func searchTextForChunk(content string) string {
	return strings.Join(tokenizeSearchText(content), " ")
}

func snippetForResult(content, query string) string {
	const maxSnippetRunes = 220
	content = strings.TrimSpace(content)
	if content == "" {
		return ""
	}

	lowerContent := strings.ToLower(content)
	for _, token := range tokenizeSearchText(query) {
		index := strings.Index(lowerContent, token)
		if index >= 0 {
			start := max(index-60, 0)
			end := min(index+len(token)+120, len(content))
			return strings.TrimSpace(content[start:end])
		}
	}

	runes := []rune(content)
	if len(runes) <= maxSnippetRunes {
		return content
	}

	return strings.TrimSpace(string(runes[:maxSnippetRunes])) + "…"
}

func reciprocalRankFusion(lexical, semantic []SearchResult, limit int) []SearchResult {
	merged := map[string]SearchResult{}

	apply := func(results []SearchResult, source string) {
		for index, result := range results {
			existing, ok := merged[result.ChunkID]
			if !ok {
				existing = result
			}

			existing.CombinedScore += 1.0 / (rrfK + float64(index) + 1)
			if source == "lexical" && result.LexicalScore > existing.LexicalScore {
				existing.LexicalScore = result.LexicalScore
			}
			if source == "semantic" && result.SemanticScore > existing.SemanticScore {
				existing.SemanticScore = result.SemanticScore
			}
			if existing.Snippet == "" {
				existing.Snippet = result.Snippet
			}

			merged[result.ChunkID] = existing
		}
	}

	apply(lexical, "lexical")
	apply(semantic, "semantic")

	fused := make([]SearchResult, 0, len(merged))
	for _, result := range merged {
		fused = append(fused, result)
	}

	sort.Slice(fused, func(i, j int) bool {
		if fused[i].CombinedScore == fused[j].CombinedScore {
			if fused[i].LexicalScore == fused[j].LexicalScore {
				return fused[i].SemanticScore > fused[j].SemanticScore
			}
			return fused[i].LexicalScore > fused[j].LexicalScore
		}
		return fused[i].CombinedScore > fused[j].CombinedScore
	})

	if limit > 0 && len(fused) > limit {
		fused = fused[:limit]
	}

	return fused
}

func rankSemanticResults(embedder Embedder, query string, candidates []SearchResult, limit int) []SearchResult {
	queryEmbedding := embedder.Embed(query)
	ranked := make([]SearchResult, 0, len(candidates))
	for _, candidate := range candidates {
		candidate.SemanticScore = cosineSimilarity(queryEmbedding, candidate.Embedding)
		candidate.Snippet = snippetForResult(candidate.Snippet, query)
		if candidate.SemanticScore < 0.2 {
			continue
		}
		ranked = append(ranked, candidate)
	}

	sort.Slice(ranked, func(i, j int) bool {
		if ranked[i].SemanticScore == ranked[j].SemanticScore {
			return ranked[i].ChunkID < ranked[j].ChunkID
		}
		return ranked[i].SemanticScore > ranked[j].SemanticScore
	})

	if limit > 0 && len(ranked) > limit {
		ranked = ranked[:limit]
	}

	return ranked
}

func normalizeLexicalResults(query string, results []SearchResult) []SearchResult {
	for index := range results {
		results[index].Snippet = snippetForResult(results[index].Snippet, query)
	}
	return results
}

func deterministicEmbedding(text string) []float64 {
	vector := make([]float64, embeddingDimensions)

	for _, token := range tokenizeSearchText(text) {
		hasher := fnv.New32a()
		_, _ = hasher.Write([]byte(token))
		index := int(hasher.Sum32()) % embeddingDimensions
		vector[index] += 1
	}

	var norm float64
	for _, value := range vector {
		norm += value * value
	}

	if norm == 0 {
		return vector
	}

	norm = math.Sqrt(norm)
	for index, value := range vector {
		vector[index] = value / norm
	}

	return vector
}

func cosineSimilarity(a, b []float64) float64 {
	if len(a) == 0 || len(a) != len(b) {
		return 0
	}

	var sum float64
	for index := range a {
		sum += a[index] * b[index]
	}

	return sum
}
