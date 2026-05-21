package app

import (
	"hash/fnv"
	"math"
	"sort"
	"strings"
)

const embeddingDimensions = 32

func chunkMarkdown(content string) []string {
	parts := strings.Split(content, "\n\n")
	chunks := make([]string, 0, len(parts))

	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed == "" {
			continue
		}

		chunks = append(chunks, trimmed)
	}

	if len(chunks) == 0 {
		return []string{strings.TrimSpace(content)}
	}

	return chunks
}

func deterministicEmbedding(text string) []float64 {
	vector := make([]float64, embeddingDimensions)

	for _, token := range strings.Fields(strings.ToLower(text)) {
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

func lexicalScore(query, candidate string) float64 {
	if candidate == "" {
		return 0
	}

	queryTokens := strings.Fields(strings.ToLower(query))
	candidateLower := strings.ToLower(candidate)

	var matches float64
	for _, token := range queryTokens {
		if strings.Contains(candidateLower, token) {
			matches++
		}
	}

	if len(queryTokens) == 0 {
		return 0
	}

	return matches / float64(len(queryTokens))
}

func fuseScores(results []SearchResult) []SearchResult {
	sort.Slice(results, func(i, j int) bool {
		if results[i].CombinedScore == results[j].CombinedScore {
			return results[i].Snippet < results[j].Snippet
		}

		return results[i].CombinedScore > results[j].CombinedScore
	})

	return results
}
