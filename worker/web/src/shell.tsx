import { useEffect, useState } from "preact/hooks";
import {
  beginBootstrap,
  beginPasskeyLogin,
  beginPasskeyRegistration,
  fetchAuthStatus,
  finishBootstrap,
  finishPasskeyLogin,
  finishPasskeyRegistration,
  signOut,
  startDevelopmentSession,
  type AuthStatus,
} from "./api.js";
import { createPasskey, getPasskey } from "./passkeys.js";

export function AuthPanel({
  onAuthChanged = async () => {},
}: {
  onAuthChanged?: () => Promise<void>;
}) {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [identityId, setIdentityId] = useState("owner");
  const [displayName, setDisplayName] = useState("Owner");
  const [setupToken, setSetupToken] = useState("");
  const [mode, setMode] = useState<"passkey" | "development">("passkey");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configuration = authStatus?.configuration ?? {
    bootstrapTokenConfigured: false,
    instancePublicUrl: null,
    localDevelopmentAuthEnabled: false,
    registrationMode: "closed",
    allowedEmailDomains: [],
    webauthnRpId: null,
    webauthnRpName: "Downwrite",
  };
  const registrationAvailable =
    !authStatus?.bootstrapRequired &&
    configuration.registrationMode !== "closed";

  async function refreshAuth() {
    try {
      setAuthStatus(await fetchAuthStatus());
    } catch {
      setAuthStatus(null);
    }
  }

  useEffect(() => {
    void refreshAuth();
  }, []);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await refreshAuth();
      await onAuthChanged();
    } catch (caught: unknown) {
      setError(
        caught instanceof Error ? caught.message : "Authentication failed",
      );
    } finally {
      setBusy(false);
    }
  }

  if (authStatus?.authenticated) {
    return (
      <section className="auth-panel auth-session" aria-label="Authentication">
        <div className="auth-row">
          <span>Signed in</span>
          <strong>{authStatus.identity?.id}</strong>
        </div>
        <button
          className="secondary-action"
          disabled={busy}
          type="button"
          onClick={() => void run(signOut)}
        >
          {busy ? "Signing out..." : "Sign out"}
        </button>
        {error && <p className="inline-error">{error}</p>}
      </section>
    );
  }

  return (
    <section className="auth-panel" aria-label="Authentication">
      <div className="auth-row">
        <strong>
          {authStatus?.bootstrapRequired ? "Bootstrap required" : "Signed out"}
        </strong>
      </div>
      <div className="segmented-control">
        <button
          className={mode === "passkey" ? "selected" : ""}
          type="button"
          onClick={() => setMode("passkey")}
        >
          Passkey
        </button>
        <button
          className={mode === "development" ? "selected" : ""}
          type="button"
          onClick={() => setMode("development")}
        >
          Development
        </button>
      </div>
      {mode === "passkey" ? (
        <div className="auth-card">
          {authStatus?.bootstrapRequired &&
            !configuration.bootstrapTokenConfigured && (
              <p className="inline-error">AUTH_BOOTSTRAP_TOKEN is missing.</p>
            )}
          <dl className="setup-list">
            <div>
              <dt>Instance</dt>
              <dd>{configuration.instancePublicUrl ?? browserOrigin()}</dd>
            </div>
            <div>
              <dt>Relying party</dt>
              <dd>{configuration.webauthnRpId ?? browserHostname()}</dd>
            </div>
            <div>
              <dt>Registration</dt>
              <dd>
                {configuration.registrationMode === "closed"
                  ? "Closed"
                  : configuration.registrationMode === "email_domain"
                    ? configuration.allowedEmailDomains.join(", ")
                    : "Open"}
              </dd>
            </div>
          </dl>
          <div className="auth-grid">
            <input
              aria-label="Identity"
              value={identityId}
              onInput={(event) => setIdentityId(event.currentTarget.value)}
            />
            {(authStatus?.bootstrapRequired || registrationAvailable) && (
              <input
                aria-label="Display name"
                value={displayName}
                onInput={(event) => setDisplayName(event.currentTarget.value)}
              />
            )}
            {authStatus?.bootstrapRequired && (
              <input
                aria-label="Bootstrap setup token"
                placeholder="Bootstrap token"
                type="password"
                value={setupToken}
                onInput={(event) => setSetupToken(event.currentTarget.value)}
              />
            )}
            <button
              className="secondary-action"
              disabled={
                busy ||
                (authStatus?.bootstrapRequired &&
                  !configuration.bootstrapTokenConfigured)
              }
              type="button"
              onClick={() =>
                void run(async () => {
                  if (authStatus?.bootstrapRequired) {
                    const result = await beginBootstrap({
                      setupToken,
                      identityId,
                      displayName,
                    });
                    const response = await createPasskey(result.options);
                    await finishBootstrap({
                      setupToken,
                      challengeId: result.challengeId,
                      response,
                    });
                    return;
                  }

                  const result = await beginPasskeyLogin(identityId);
                  const response = await getPasskey(result.options);
                  await finishPasskeyLogin({
                    challengeId: result.challengeId,
                    response,
                  });
                })
              }
            >
              {busy
                ? "Working..."
                : authStatus?.bootstrapRequired
                  ? "Create owner passkey"
                  : "Sign in with passkey"}
            </button>
            {!authStatus?.bootstrapRequired && !authStatus?.authenticated && (
              <button
                className="secondary-action"
                disabled={busy || !registrationAvailable}
                type="button"
                onClick={() =>
                  void run(async () => {
                    const result = await beginPasskeyRegistration({
                      identityId,
                      displayName,
                    });
                    const response = await createPasskey(result.options);
                    await finishPasskeyRegistration({
                      challengeId: result.challengeId,
                      response,
                    });
                  })
                }
              >
                {busy ? "Working..." : "Create passkey"}
              </button>
            )}
          </div>
          {!authStatus?.bootstrapRequired &&
            !authStatus?.authenticated &&
            configuration.registrationMode === "closed" && (
              <p className="inline-error">
                Registration is closed for this instance.
              </p>
            )}
        </div>
      ) : (
        <div className="token auth-card">
          <p>
            Local sign-in is available only for <code>wrangler dev</code> on
            localhost when <code>DOWNWRITE_LOCAL_AUTH=1</code> is set in{" "}
            <code>.dev.vars</code>.
          </p>
          <button
            className="secondary-action"
            disabled={
              busy ||
              authStatus?.authenticated ||
              !configuration.localDevelopmentAuthEnabled
            }
            type="button"
            onClick={() =>
              void run(async () => {
                await startDevelopmentSession({
                  identityId: "local-owner",
                  displayName: "Local Owner",
                });
              })
            }
          >
            {busy
              ? "Signing in..."
              : authStatus?.authenticated
                ? "Local session active"
                : "Start local owner session"}
          </button>
          {!configuration.localDevelopmentAuthEnabled && (
            <p className="inline-error">Local development sign-in is off.</p>
          )}
        </div>
      )}
      {error && <p className="inline-error">{error}</p>}
    </section>
  );
}

function browserOrigin() {
  return typeof location === "undefined" ? "" : location.origin;
}

function browserHostname() {
  return typeof location === "undefined" ? "" : location.hostname;
}
