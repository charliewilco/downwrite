package app

import (
	"errors"
	"os"
)

type Config struct {
	Addr            string
	DatabaseURL     string
	SessionSecret   string
	MCPWriteEnabled bool
}

func LoadConfig() (Config, error) {
	cfg := Config{
		Addr:            getenv("DOWNWRITE_ADDR", ":7878"),
		DatabaseURL:     os.Getenv("DOWNWRITE_DATABASE_URL"),
		SessionSecret:   os.Getenv("DOWNWRITE_SESSION_SECRET"),
		MCPWriteEnabled: os.Getenv("DOWNWRITE_MCP_WRITE_ENABLED") == "true",
	}

	if cfg.DatabaseURL == "" {
		return Config{}, errors.New("DOWNWRITE_DATABASE_URL is required")
	}

	if cfg.SessionSecret == "" {
		return Config{}, errors.New("DOWNWRITE_SESSION_SECRET is required")
	}

	return cfg, nil
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}
