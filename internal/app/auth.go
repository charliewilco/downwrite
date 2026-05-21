package app

import (
	"context"
	"errors"
	"strings"
	"time"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

var (
	errInvalidCredentials = errors.New("invalid credentials")
	errAccountConflict    = errors.New("account conflict")
	errWeakPassword       = errors.New("weak password")
)

const passwordStandardMessage = "Password must be at least 6 characters and include a lowercase letter, uppercase letter, number, and special character."

type Authenticator struct {
	store         Store
	sessionSecret string
}

func NewAuthenticator(store Store, sessionSecret string) Authenticator {
	return Authenticator{
		store:         store,
		sessionSecret: sessionSecret,
	}
}

func (a Authenticator) Signup(ctx context.Context, name, email, password string) (User, Session, error) {
	if !meetsPasswordStandard(password) {
		return User{}, Session{}, errWeakPassword
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return User{}, Session{}, err
	}

	user, _, err := a.store.CreateUserWithWorkspace(ctx, strings.TrimSpace(name), strings.TrimSpace(email), string(hash))
	if err != nil {
		return User{}, Session{}, errAccountConflict
	}

	session, err := a.store.CreateSession(ctx, user.ID)
	if err != nil {
		return User{}, Session{}, err
	}

	return user, session, nil
}

func meetsPasswordStandard(password string) bool {
	var hasLower bool
	var hasUpper bool
	var hasNumber bool
	var hasSpecial bool
	var length int

	for _, char := range password {
		length++

		switch {
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsDigit(char):
			hasNumber = true
		case !unicode.IsLetter(char) && !unicode.IsDigit(char) && !unicode.IsSpace(char):
			hasSpecial = true
		}
	}

	return length >= 6 && hasLower && hasUpper && hasNumber && hasSpecial
}

func (a Authenticator) Login(ctx context.Context, email, password string) (User, Session, error) {
	user, err := a.store.GetUserByEmail(ctx, strings.TrimSpace(email))
	if err != nil {
		return User{}, Session{}, errInvalidCredentials
	}

	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)) != nil {
		return User{}, Session{}, errInvalidCredentials
	}

	session, err := a.store.CreateSession(ctx, user.ID)
	if err != nil {
		return User{}, Session{}, err
	}

	return user, session, nil
}

func (a Authenticator) Logout(ctx context.Context, sessionID string) error {
	return a.store.DeleteSession(ctx, sessionID)
}

func (a Authenticator) AuthResponse(ctx context.Context, user User, session Session) (apiAuthBody, bool) {
	workspaces, err := a.store.ListWorkspacesForUser(ctx, user.ID)
	if err != nil || len(workspaces) == 0 {
		return apiAuthBody{}, false
	}

	return apiAuthBody{
		Session: apiSessionBody{
			Token:     signValue(a.sessionSecret, session.ID),
			ExpiresAt: session.ExpiresAt.UTC().Format(time.RFC3339),
		},
		User:               user,
		Workspaces:         workspaces,
		DefaultWorkspaceID: workspaces[0].ID,
	}, true
}
