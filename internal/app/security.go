package app

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"strings"
)

func randomToken(length int) (string, error) {
	buffer := make([]byte, length)
	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}

	return hex.EncodeToString(buffer), nil
}

func signValue(secret, value string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(value))
	signature := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	return fmt.Sprintf("%s.%s", value, signature)
}

func verifySignedValue(secret, raw string) (string, bool) {
	value, _, ok := strings.Cut(raw, ".")
	if !ok {
		return "", false
	}

	expected := signValue(secret, value)
	return value, hmac.Equal([]byte(expected), []byte(raw))
}
