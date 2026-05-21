package app

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const apiVersion = "v1"

type apiErrorCode string

const (
	apiErrorUnauthorized       apiErrorCode = "unauthorized"
	apiErrorInvalidCredentials apiErrorCode = "invalid_credentials"
	apiErrorValidationFailed   apiErrorCode = "validation_failed"
	apiErrorNotFound           apiErrorCode = "not_found"
	apiErrorConflict           apiErrorCode = "conflict"
	apiErrorInternal           apiErrorCode = "internal_error"
)

type apiFieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type apiErrorBody struct {
	Code    apiErrorCode    `json:"code"`
	Message string          `json:"message"`
	Fields  []apiFieldError `json:"fields,omitempty"`
}

type apiSessionBody struct {
	Token     string `json:"token"`
	ExpiresAt string `json:"expires_at"`
}

type apiAuthBody struct {
	Session            apiSessionBody `json:"session"`
	User               User           `json:"user"`
	Workspaces         []Workspace    `json:"workspaces"`
	DefaultWorkspaceID string         `json:"default_workspace_id"`
}

func writeAPIError(c *gin.Context, status int, code apiErrorCode, message string, fields ...apiFieldError) {
	c.JSON(status, gin.H{
		"error": apiErrorBody{
			Code:    code,
			Message: message,
			Fields:  fields,
		},
	})
}

func writeUnauthorized(c *gin.Context) {
	writeAPIError(c, http.StatusUnauthorized, apiErrorUnauthorized, "Authentication is required.")
}

func openAPIOperation(summary string, protected bool) gin.H {
	operation := gin.H{
		"summary": summary,
		"responses": gin.H{
			"200": gin.H{"description": "Success"},
			"400": gin.H{"description": "Validation failed"},
			"401": gin.H{"description": "Authentication is required"},
			"404": gin.H{"description": "Resource not found"},
			"500": gin.H{"description": "Internal error"},
		},
	}
	if protected {
		operation["security"] = []gin.H{{"bearerAuth": []string{}}}
	}
	return operation
}

func (a *App) sessionIDFromRequest(c *gin.Context) (string, bool) {
	authHeader := strings.TrimSpace(c.GetHeader("Authorization"))
	if strings.HasPrefix(authHeader, "Bearer ") {
		return verifySignedValue(a.config.SessionSecret, strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer ")))
	}

	if cookie, err := c.Cookie("downwrite_session"); err == nil {
		return verifySignedValue(a.config.SessionSecret, cookie)
	}

	return "", false
}
