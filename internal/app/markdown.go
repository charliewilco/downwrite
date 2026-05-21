package app

import (
	"bytes"
	"regexp"
	"strings"

	"github.com/yuin/goldmark"
)

var tagPattern = regexp.MustCompile(`<[^>]+>`)

func renderMarkdown(input string) (string, string, error) {
	var buf bytes.Buffer
	if err := goldmark.Convert([]byte(input), &buf); err != nil {
		return "", "", err
	}

	html := buf.String()
	text := strings.TrimSpace(tagPattern.ReplaceAllString(html, " "))
	text = strings.Join(strings.Fields(text), " ")

	return html, text, nil
}
