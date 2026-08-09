import {
  acceptInvitation,
  beginBootstrap,
  beginPasskeyLogin,
  beginPasskeyRegistration,
  createInvitation,
  createPublicLink,
  fetchAuthStatus,
  fetchShareState,
  finishBootstrap,
  finishPasskeyLogin,
  finishPasskeyRegistration,
  removeCollaborator,
  revokeInvitation,
  signOut,
  startDevelopmentSession,
  updatePublicLink,
  type AuthStatus,
  type Role,
  type ShareState,
} from "./api.js";
import { DEFAULT_ACCENT } from "./app-constants.js";
import type { MarkdownDropDetail } from "./MarkdownDragArea.js";
import { createPasskey, getPasskey } from "./passkeys.js";
import {
  createDocumentInGroup,
  createGroupInCache,
  deleteGroupFromCache,
  getCachedGroups,
  importMarkdownFilesToGroup,
  loadGroups,
  positionDocumentAndRefresh,
  refreshGroups,
  updateGroupInCache,
  workspaceToken,
} from "./workspace-state.js";

interface MarkdownImport {
  title: string;
  content: string;
}

class AuthPanel extends HTMLElement {
  private authStatus: AuthStatus | null = null;
  private mode: "passkey" | "development" = "passkey";
  private busy = false;
  private error: string | null = null;

  connectedCallback() {
    this.addEventListener("click", (event) => {
      const trigger = (event.target as Element | null)?.closest("button");
      if (!trigger) {
        return;
      }
      void this.handleAuthClick(trigger);
    });
    void this.refreshAuth();
  }

  private async refreshAuth() {
    try {
      this.authStatus = await fetchAuthStatus();
    } catch {
      this.authStatus = null;
    }
    this.render();
  }

  private async handleAuthClick(trigger: HTMLButtonElement) {
    const action = trigger.dataset.authAction;

    if (action === "mode-passkey") {
      this.mode = "passkey";
      this.render();
      return;
    }

    if (action === "mode-development") {
      this.mode = "development";
      this.render();
      return;
    }

    if (action === "sign-out") {
      await this.run(signOut);
      return;
    }

    if (action === "passkey") {
      await this.run(async () => {
        if (this.authStatus?.bootstrapRequired) {
          const result = await beginBootstrap({
            setupToken: this.input("setupToken"),
            identityId: this.input("identityId"),
            displayName: this.input("displayName"),
          });
          const response = await createPasskey(result.options);
          await finishBootstrap({
            setupToken: this.input("setupToken"),
            challengeId: result.challengeId,
            response,
          });
          return;
        }

        const result = await beginPasskeyLogin(this.input("identityId"));
        const response = await getPasskey(result.options);
        await finishPasskeyLogin({
          challengeId: result.challengeId,
          response,
        });
      });
      return;
    }

    if (action === "register-passkey") {
      await this.run(async () => {
        const result = await beginPasskeyRegistration({
          identityId: this.input("identityId"),
          displayName: this.input("displayName"),
        });
        const response = await createPasskey(result.options);
        await finishPasskeyRegistration({
          challengeId: result.challengeId,
          response,
        });
      });
      return;
    }

    if (action === "development-session") {
      await this.run(async () => {
        await startDevelopmentSession({
          identityId: "local-owner",
          displayName: "Local Owner",
        });
      });
    }
  }

  private async run(action: () => Promise<void>) {
    this.busy = true;
    this.error = null;
    this.render();

    try {
      await action();
      await this.refreshAuth();
    } catch (caught: unknown) {
      this.error = errorMessage(caught, "Authentication failed");
      this.render();
    } finally {
      this.busy = false;
      this.render();
    }
  }

  private input(name: string) {
    return inputValue(this, name);
  }

  private render() {
    const configuration = this.authStatus?.configuration ?? {
      bootstrapTokenConfigured: false,
      instancePublicUrl: null,
      localDevelopmentAuthEnabled: false,
      registrationMode: "closed",
      allowedEmailDomains: [],
      webauthnRpId: null,
      webauthnRpName: "Downwrite",
    };
    const registrationAvailable =
      !this.authStatus?.bootstrapRequired &&
      configuration.registrationMode !== "closed";

    if (this.authStatus?.authenticated) {
      this.innerHTML = `
        <section class="auth-panel auth-session" aria-label="Authentication">
          <div class="auth-row">
            <span>Signed in</span>
            <strong>${escapeHtml(this.authStatus.identity?.id ?? "")}</strong>
          </div>
          <button class="secondary-action" data-auth-action="sign-out" ${
            this.busy ? "disabled" : ""
          } type="button">${this.busy ? "Signing out..." : "Sign out"}</button>
          ${this.errorHtml()}
        </section>
      `;
      return;
    }

    this.innerHTML = `
      <section class="auth-panel" aria-label="Authentication">
        <div class="auth-row">
          <strong>${this.authStatus?.bootstrapRequired ? "Bootstrap required" : "Signed out"}</strong>
        </div>
        <div class="segmented-control">
          <button class="${this.mode === "passkey" ? "selected" : ""}" data-auth-action="mode-passkey" type="button">Passkey</button>
          <button class="${this.mode === "development" ? "selected" : ""}" data-auth-action="mode-development" type="button">Development</button>
        </div>
        ${
          this.mode === "passkey"
            ? this.passkeyHtml(configuration, registrationAvailable)
            : this.developmentHtml(configuration)
        }
        ${this.errorHtml()}
      </section>
    `;
  }

  private passkeyHtml(
    configuration: AuthStatus["configuration"],
    registrationAvailable: boolean,
  ) {
    return `
      <div class="auth-card">
        ${
          this.authStatus?.bootstrapRequired &&
          !configuration.bootstrapTokenConfigured
            ? `<p class="inline-error">AUTH_BOOTSTRAP_TOKEN is missing.</p>`
            : ""
        }
        <dl class="setup-list">
          <div>
            <dt>Instance</dt>
            <dd>${escapeHtml(configuration.instancePublicUrl ?? location.origin)}</dd>
          </div>
          <div>
            <dt>Relying party</dt>
            <dd>${escapeHtml(configuration.webauthnRpId ?? location.hostname)}</dd>
          </div>
          <div>
            <dt>Registration</dt>
            <dd>${escapeHtml(registrationLabel(configuration))}</dd>
          </div>
        </dl>
        <div class="auth-grid">
          <input aria-label="Identity" name="identityId" value="owner">
          ${
            this.authStatus?.bootstrapRequired || registrationAvailable
              ? `<input aria-label="Display name" name="displayName" value="Owner">`
              : ""
          }
          ${
            this.authStatus?.bootstrapRequired
              ? `<input aria-label="Bootstrap setup token" name="setupToken" placeholder="Bootstrap token" type="password">`
              : ""
          }
          <button class="secondary-action" data-auth-action="passkey" ${
            this.busy ||
            (this.authStatus?.bootstrapRequired &&
              !configuration.bootstrapTokenConfigured)
              ? "disabled"
              : ""
          } type="button">${
            this.busy
              ? "Working..."
              : this.authStatus?.bootstrapRequired
                ? "Create owner passkey"
                : "Sign in with passkey"
          }</button>
          ${
            !this.authStatus?.bootstrapRequired &&
            !this.authStatus?.authenticated
              ? `<button class="secondary-action" data-auth-action="register-passkey" ${
                  this.busy || !registrationAvailable ? "disabled" : ""
                } type="button">${this.busy ? "Working..." : "Create passkey"}</button>`
              : ""
          }
        </div>
        ${
          !this.authStatus?.bootstrapRequired &&
          !this.authStatus?.authenticated &&
          configuration.registrationMode === "closed"
            ? `<p class="inline-error">Registration is closed for this instance.</p>`
            : ""
        }
      </div>
    `;
  }

  private developmentHtml(configuration: AuthStatus["configuration"]) {
    return `
      <div class="token auth-card">
        <p>
          Local sign-in is available only for <code>wrangler dev</code> on
          localhost when <code>DOWNWRITE_LOCAL_AUTH=1</code> is set in
          <code>.dev.vars</code>.
        </p>
        <button class="secondary-action" data-auth-action="development-session" ${
          this.busy || !configuration.localDevelopmentAuthEnabled
            ? "disabled"
            : ""
        } type="button">${this.busy ? "Signing in..." : "Start local owner session"}</button>
        ${
          !configuration.localDevelopmentAuthEnabled
            ? `<p class="inline-error">Local development sign-in is off.</p>`
            : ""
        }
      </div>
    `;
  }

  private errorHtml() {
    return this.error
      ? `<p class="inline-error">${escapeHtml(this.error)}</p>`
      : "";
  }
}

class MarkdownImportDialog extends HTMLElement {
  private imports: MarkdownImport[] = [];
  private groups: Awaited<ReturnType<typeof loadGroups>> = [];
  private imported = false;

  connectedCallback() {
    this.render();
    document.addEventListener("markdown-files-drop", this.handleDrop);
    this.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.runImport();
    });
    this.addEventListener("click", (event) => {
      const trigger = (event.target as Element | null)?.closest("button");
      if (trigger?.dataset.importAction === "cancel") {
        this.clear();
      }
      if (trigger?.dataset.importMode) {
        this.mode = trigger.dataset.importMode as "existing" | "new";
        this.render();
      }
    });
  }

  disconnectedCallback() {
    document.removeEventListener("markdown-files-drop", this.handleDrop);
  }

  private mode: "existing" | "new" = "existing";

  private handleDrop = (event: Event) => {
    const detail = (event as CustomEvent<MarkdownDropDetail>).detail;
    void this.prepareImport(detail);
  };

  private async prepareImport({ files, workspaceId }: MarkdownDropDetail) {
    try {
      const nextImports = await readMarkdownImports(files);
      setError(this, null);

      if (workspaceId) {
        const document = await importMarkdownFilesToGroup(
          workspaceId,
          nextImports,
        );
        if (document) {
          window.location.assign(
            `/documents/${encodeURIComponent(document.id)}`,
          );
        }
        return;
      }

      this.groups = await loadGroups();
      this.imports = nextImports;
      this.mode = this.groups.length > 0 ? "existing" : "new";
      this.imported = false;
      this.render();
      this.dialog?.showModal();
    } catch (caught: unknown) {
      setError(this, errorMessage(caught, "Import failed"));
    }
  }

  private async runImport() {
    const groupId =
      this.mode === "existing"
        ? inputValue(this, "groupId")
        : (
            await createGroupInCache({
              name: inputValue(this, "name") || "Untitled workspace",
              description: inputValue(this, "description") || null,
              accentColor: inputValue(this, "accentColor") || DEFAULT_ACCENT,
            })
          ).id;

    try {
      this.imported = true;
      const document = await importMarkdownFilesToGroup(groupId, this.imports);
      this.clear();
      if (document) {
        window.location.assign(`/documents/${encodeURIComponent(document.id)}`);
      }
    } catch (caught: unknown) {
      setError(this, errorMessage(caught, "Import failed"));
    }
  }

  private clear() {
    this.imports = [];
    this.dialog?.close();
    this.render();
  }

  private get dialog() {
    return this.querySelector<HTMLDialogElement>("dialog");
  }

  private render() {
    this.innerHTML = `
      <p class="status error" data-inline-error hidden></p>
      <dialog class="import-dialog">
        <form class="import-dialog-body" method="dialog">
          <header>
            <p class="eyebrow">Markdown import</p>
            <h2>${this.imports.length} document${this.imports.length === 1 ? "" : "s"}</h2>
          </header>
          <ul class="import-file-list">
            ${this.imports
              .map(
                (item) => `
                  <li>
                    <span>${escapeHtml(item.title)}</span>
                    <small>${item.content.length.toLocaleString()} characters</small>
                  </li>
                `,
              )
              .join("")}
          </ul>
          <div class="segmented-control">
            <button class="${this.mode === "existing" ? "selected" : ""}" ${
              this.groups.length === 0 ? "disabled" : ""
            } data-import-mode="existing" type="button">Existing workspace</button>
            <button class="${this.mode === "new" ? "selected" : ""}" data-import-mode="new" type="button">New workspace</button>
          </div>
          ${
            this.mode === "existing"
              ? this.existingWorkspaceHtml()
              : this.newWorkspaceHtml()
          }
          <p class="inline-error" data-inline-error hidden></p>
          <div class="toolbar-actions">
            <button class="secondary-action" data-import-action="cancel" type="button">Cancel</button>
            <button class="primary-action" type="submit">Import</button>
          </div>
        </form>
      </dialog>
    `;

    this.dialog?.addEventListener("cancel", (event) => {
      event.preventDefault();
      this.clear();
    });
    this.dialog?.addEventListener("close", () => {
      if (!this.imported && this.imports.length > 0) {
        this.clear();
      }
    });
  }

  private existingWorkspaceHtml() {
    return `
      <label>
        <span>Workspace</span>
        <select name="groupId">
          ${this.groups
            .map(
              (group) =>
                `<option value="${escapeAttribute(group.id)}">${escapeHtml(
                  group.name,
                )}</option>`,
            )
            .join("")}
        </select>
      </label>
    `;
  }

  private newWorkspaceHtml() {
    return `
      <label>
        <span>Name</span>
        <input name="name">
      </label>
      <label>
        <span>Description</span>
        <textarea name="description"></textarea>
      </label>
      <label class="color-row">
        <span>Accent</span>
        <input name="accentColor" type="color" value="${DEFAULT_ACCENT}">
      </label>
    `;
  }
}

class CreateWorkspaceForm extends HTMLElement {
  connectedCallback() {
    form(this)?.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.submit();
    });
  }

  private async submit() {
    const submit = submitButton(this);
    setError(this, null);
    setBusy(submit, true, "Creating...");

    try {
      const group = await createGroupInCache({
        name: value(this, "name") || "Untitled workspace",
        description: value(this, "description") || null,
        accentColor: value(this, "accentColor") || DEFAULT_ACCENT,
      });
      window.location.assign(`/workspaces/${encodeURIComponent(group.id)}`);
    } catch (caught: unknown) {
      setError(this, errorMessage(caught, "Create workspace failed"));
    } finally {
      setBusy(submit, false);
    }
  }
}

class CreateDocumentForm extends HTMLElement {
  connectedCallback() {
    form(this)?.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.submit();
    });
  }

  private async submit() {
    const submit = submitButton(this);
    const groupId = value(this, "groupId");

    if (!groupId) {
      setError(this, "Choose a workspace.");
      return;
    }

    setError(this, null);
    setBusy(submit, true, "Creating...");

    try {
      const document = await createDocumentInGroup(groupId);
      window.location.assign(`/documents/${encodeURIComponent(document.id)}`);
    } catch (caught: unknown) {
      setError(this, errorMessage(caught, "Create document failed"));
    } finally {
      setBusy(submit, false);
    }
  }
}

class CreateDocumentButton extends HTMLElement {
  connectedCallback() {
    button(this)?.addEventListener("click", () => void this.create());
  }

  private async create() {
    const groupId = this.getAttribute("group-id") ?? "";
    const trigger = button(this);

    if (!groupId) {
      return;
    }

    setBusy(trigger, true, "Creating...");

    try {
      const document = await createDocumentInGroup(groupId);
      window.location.assign(`/documents/${encodeURIComponent(document.id)}`);
    } finally {
      setBusy(trigger, false);
    }
  }
}

class DocumentOrderControls extends HTMLElement {
  connectedCallback() {
    this.addEventListener("click", (event) => {
      const trigger = (event.target as Element | null)?.closest("button");
      if (!trigger) {
        return;
      }
      void this.move(trigger);
    });
  }

  private async move(trigger: HTMLButtonElement) {
    const documentId = this.getAttribute("document-id") ?? "";
    const revision = Number(this.getAttribute("revision") ?? "0");
    const position = Number(trigger.dataset.position ?? "NaN");

    if (!documentId || Number.isNaN(position)) {
      return;
    }

    setBusy(trigger, true);
    await positionDocumentAndRefresh(documentId, position, revision);
    window.location.reload();
  }
}

class WorkspaceSettingsForm extends HTMLElement {
  connectedCallback() {
    form(this)?.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.save();
    });
    this.querySelector("[data-delete-workspace]")?.addEventListener(
      "click",
      () => void this.delete(),
    );
    this.querySelector("[data-cancel-delete]")?.addEventListener("click", () =>
      this.setConfirmingDelete(false),
    );
  }

  private async save() {
    const groupId = this.getAttribute("group-id") ?? "";
    const submit = submitButton(this);

    setNotice(this, null);
    setError(this, null);
    setBusy(submit, true, "Saving...");

    try {
      await updateGroupInCache(groupId, {
        name: value(this, "name"),
        description: value(this, "description") || null,
        accentColor: value(this, "accentColor"),
      });
      setNotice(this, "Workspace saved");
    } catch (caught: unknown) {
      setError(this, errorMessage(caught, "Save failed"));
    } finally {
      setBusy(submit, false);
    }
  }

  private async delete() {
    const groupId = this.getAttribute("group-id") ?? "";

    if (!this.hasAttribute("confirming-delete")) {
      this.setConfirmingDelete(true);
      return;
    }

    try {
      await deleteGroupFromCache(groupId);
      window.location.assign("/");
    } catch (caught: unknown) {
      setError(this, errorMessage(caught, "Delete failed"));
    }
  }

  private setConfirmingDelete(confirming: boolean) {
    this.toggleAttribute("confirming-delete", confirming);
    const cancel = this.querySelector<HTMLButtonElement>(
      "[data-cancel-delete]",
    );
    const deleteButton = this.querySelector<HTMLButtonElement>(
      "[data-delete-workspace]",
    );
    if (cancel) {
      cancel.hidden = !confirming;
    }
    if (deleteButton) {
      deleteButton.textContent = confirming
        ? "Confirm delete"
        : "Delete workspace";
    }
  }
}

class InvitationAcceptForm extends HTMLElement {
  connectedCallback() {
    form(this)?.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.accept();
    });
  }

  private async accept() {
    const submit = submitButton(this);

    setNotice(this, null);
    setError(this, null);
    setBusy(submit, true, "Accepting...");

    try {
      const invitation = await acceptInvitation(
        workspaceToken,
        value(this, "invitationToken"),
      );
      setNotice(this, "Invitation accepted");
      await refreshGroups();
      const groupId = getCachedGroups().find((group) =>
        group.documents.some(
          (document) => document.id === invitation.documentId,
        ),
      )?.id;
      window.location.assign(
        groupId
          ? `/workspaces/${encodeURIComponent(groupId)}`
          : `/documents/${encodeURIComponent(invitation.documentId)}`,
      );
    } catch (caught: unknown) {
      setError(this, errorMessage(caught, "Accept failed"));
    } finally {
      setBusy(submit, false);
    }
  }
}

class ShareControls extends HTMLElement {
  private share: ShareState | null = null;

  connectedCallback() {
    this.picker?.addEventListener("input", () => void this.refresh());
    this.panel?.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.submit(event.target as HTMLFormElement);
    });
    this.panel?.addEventListener("click", (event) => {
      const trigger = (event.target as Element | null)?.closest("button");
      if (!trigger) {
        return;
      }
      void this.action(trigger);
    });
    void this.refresh();
  }

  private get picker() {
    return this.querySelector<HTMLSelectElement>("[name='documentId']");
  }

  private get panel() {
    return this.querySelector<HTMLElement>("[data-share-panel]");
  }

  private get documentId() {
    return this.picker?.value ?? "";
  }

  private async refresh() {
    if (!this.documentId) {
      return;
    }

    setNotice(this, null);
    setError(this, null);

    try {
      this.share = await fetchShareState(workspaceToken, this.documentId);
      this.render();
    } catch (caught: unknown) {
      setError(this, errorMessage(caught, "Share request failed"));
    }
  }

  private async submit(formElement: HTMLFormElement) {
    const kind = formElement.dataset.shareAction;

    try {
      setError(this, null);

      if (kind === "invite") {
        await createInvitation(workspaceToken, this.documentId, {
          identityId: formValue(formElement, "identityId"),
          role: formValue(formElement, "role") as Role,
        });
        formElement.reset();
      }

      if (kind === "accept") {
        await acceptInvitation(workspaceToken, formValue(formElement, "token"));
        formElement.reset();
      }

      if (kind === "create-link") {
        await createPublicLink(
          workspaceToken,
          this.documentId,
          formValue(formElement, "label") || null,
        );
      }

      await this.refresh();
    } catch (caught: unknown) {
      setError(this, errorMessage(caught, "Share action failed"));
    }
  }

  private async action(trigger: HTMLButtonElement) {
    const action = trigger.dataset.shareAction;

    try {
      setError(this, null);

      if (action === "remove") {
        await removeCollaborator(
          workspaceToken,
          this.documentId,
          trigger.dataset.identityId ?? "",
        );
        await this.refresh();
      }

      if (action === "revoke-invitation") {
        await revokeInvitation(
          workspaceToken,
          trigger.dataset.invitationId ?? "",
        );
        await this.refresh();
      }

      if (action === "copy-invitation") {
        await copyText(
          `${location.origin}/invitations/${trigger.dataset.token}`,
        );
        setNotice(this, "Invitation URL copied");
      }

      if (action === "save-link") {
        const row = trigger.closest("[data-public-link-id]");
        await updatePublicLink(
          workspaceToken,
          trigger.dataset.publicLinkId ?? "",
          {
            label: inputValue(row, "label") || null,
          },
        );
        await this.refresh();
      }

      if (action === "copy-link") {
        await copyText(`${location.origin}/public/${trigger.dataset.token}`);
        setNotice(this, "Public URL copied");
      }

      if (action === "toggle-link") {
        await updatePublicLink(
          workspaceToken,
          trigger.dataset.publicLinkId ?? "",
          {
            active: trigger.dataset.active !== "true",
          },
        );
        await this.refresh();
      }
    } catch (caught: unknown) {
      setError(this, errorMessage(caught, "Share action failed"));
    }
  }

  private render() {
    const panel = this.panel;
    if (!panel || !this.share) {
      return;
    }

    panel.innerHTML = `
      <div class="share-column">
        <h2>Collaborators</h2>
        <form class="inline-form" data-share-action="invite">
          <input aria-label="Invite identity" name="identityId" placeholder="identity id">
          <select aria-label="Invite role" name="role">
            <option value="editor">editor</option>
            <option value="owner">owner</option>
          </select>
          <button class="secondary-action" type="submit">Invite</button>
        </form>
        <ul class="share-list">${this.renderCollaborators()}</ul>
      </div>
      <div class="share-column">
        <h2>Invitations</h2>
        <form class="inline-form" data-share-action="accept">
          <input aria-label="Invitation token" name="token" placeholder="paste invitation token">
          <button class="secondary-action" type="submit">Accept</button>
        </form>
        <ul class="share-list">${this.renderInvitations()}</ul>
      </div>
      <div class="share-column">
        <h2>Public links</h2>
        <form class="inline-form" data-share-action="create-link">
          <input aria-label="Public link label" name="label" value="Public read link">
          <button class="secondary-action" type="submit">Create link</button>
        </form>
        <ul class="share-list">${this.renderPublicLinks()}</ul>
      </div>
    `;
  }

  private renderCollaborators() {
    const collaborators = this.share?.collaborators ?? [];
    if (collaborators.length === 0) {
      return `<li class="empty-row">No collaborators yet.</li>`;
    }

    return collaborators
      .map(
        (collaborator) => `
          <li>
            <span>${escapeHtml(collaborator.displayName ?? collaborator.identityId)}</span>
            <strong>${escapeHtml(collaborator.role)}</strong>
            <button class="secondary-action" data-share-action="remove" data-identity-id="${escapeAttribute(
              collaborator.identityId,
            )}" type="button">Remove</button>
          </li>
        `,
      )
      .join("");
  }

  private renderInvitations() {
    const invitations = this.share?.invitations ?? [];
    if (invitations.length === 0) {
      return `<li class="empty-row">No invitations yet.</li>`;
    }

    return invitations
      .map(
        (invitation) => `
          <li>
            <span>${escapeHtml(invitation.invitedIdentityId)} · ${escapeHtml(
              invitation.status,
            )}</span>
            <code>${escapeHtml(invitation.token)}</code>
            <button class="secondary-action" data-share-action="copy-invitation" data-token="${escapeAttribute(
              invitation.token,
            )}" type="button">Copy invite URL</button>
            ${
              invitation.status === "pending"
                ? `<button class="secondary-action" data-share-action="revoke-invitation" data-invitation-id="${escapeAttribute(
                    invitation.id,
                  )}" type="button">Revoke</button>`
                : ""
            }
          </li>
        `,
      )
      .join("");
  }

  private renderPublicLinks() {
    const links = this.share?.publicLinks ?? [];
    if (links.length === 0) {
      return `<li class="empty-row">No public links yet.</li>`;
    }

    return links
      .map((link) => {
        const publicUrl = `${location.origin}/public/${link.token}`;
        return `
          <li data-public-link-id="${escapeAttribute(link.id)}">
            <span>${link.active ? "Active" : "Revoked"}</span>
            <input aria-label="Public link label" name="label" value="${escapeAttribute(
              link.label ?? "",
            )}">
            <code>${escapeHtml(publicUrl)}</code>
            <div class="toolbar-actions">
              <button class="secondary-action" data-share-action="save-link" data-public-link-id="${escapeAttribute(
                link.id,
              )}" type="button">Save label</button>
              <button class="secondary-action" data-share-action="copy-link" data-token="${escapeAttribute(
                link.token,
              )}" type="button">Copy URL</button>
              <button class="secondary-action" data-share-action="toggle-link" data-public-link-id="${escapeAttribute(
                link.id,
              )}" data-active="${String(link.active)}" type="button">${
                link.active ? "Revoke" : "Enable"
              }</button>
            </div>
          </li>
        `;
      })
      .join("");
  }
}

function defineElement(name: string, constructor: CustomElementConstructor) {
  if (!customElements.get(name)) {
    customElements.define(name, constructor);
  }
}

function form(root: ParentNode) {
  return root.querySelector<HTMLFormElement>("form");
}

function button(root: ParentNode) {
  return root.querySelector<HTMLButtonElement>("button");
}

function submitButton(root: ParentNode) {
  return root.querySelector<HTMLButtonElement>("button[type='submit']");
}

function value(root: ParentNode, name: string) {
  return inputValue(root, name);
}

function inputValue(root: ParentNode | null, name: string) {
  return (
    root
      ?.querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >(`[name='${name}']`)
      ?.value.trim() ?? ""
  );
}

function formValue(formElement: HTMLFormElement, name: string) {
  return new FormData(formElement).get(name)?.toString().trim() ?? "";
}

function setBusy(
  trigger: HTMLButtonElement | null | undefined,
  busy: boolean,
  label?: string,
) {
  if (!trigger) {
    return;
  }

  if (busy) {
    trigger.dataset.idleLabel = trigger.textContent ?? "";
    trigger.textContent = label ?? trigger.textContent;
  } else if (trigger.dataset.idleLabel) {
    trigger.textContent = trigger.dataset.idleLabel;
    delete trigger.dataset.idleLabel;
  }
  trigger.disabled = busy;
}

function setNotice(root: ParentNode, message: string | null) {
  setMessage(root, "[data-inline-notice]", message);
}

function setError(root: ParentNode, message: string | null) {
  setMessage(root, "[data-inline-error]", message);
}

function setMessage(
  root: ParentNode,
  selector: string,
  message: string | null,
) {
  const target = root.querySelector<HTMLElement>(selector);
  if (!target) {
    return;
  }

  target.textContent = message ?? "";
  target.hidden = !message;
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}

async function readMarkdownImports(files: FileList | File[]) {
  const markdownFiles = Array.from(files).filter(isMarkdownFile);
  if (markdownFiles.length === 0) {
    throw new Error("Drop Markdown files ending in .md or .markdown.");
  }

  return Promise.all(
    markdownFiles.map(async (file) => ({
      title: titleFromFileName(file.name),
      content: await file.text(),
    })),
  );
}

function isMarkdownFile(file: File) {
  const name = file.name.toLocaleLowerCase();
  return (
    name.endsWith(".md") ||
    name.endsWith(".markdown") ||
    file.type === "text/markdown"
  );
}

function titleFromFileName(name: string) {
  return (
    name
      .replace(/\.(md|markdown)$/i, "")
      .replace(/[-_]+/g, " ")
      .trim() || "Untitled document"
  );
}

function registrationLabel(configuration: AuthStatus["configuration"]) {
  if (configuration.registrationMode === "closed") {
    return "Closed";
  }
  if (configuration.registrationMode === "email_domain") {
    return configuration.allowedEmailDomains.join(", ");
  }
  return "Open";
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function escapeAttribute(value: string) {
  return escapeHtml(value);
}

defineElement("dw-create-workspace-form", CreateWorkspaceForm);
defineElement("dw-create-document-form", CreateDocumentForm);
defineElement("dw-create-document-button", CreateDocumentButton);
defineElement("dw-document-order-controls", DocumentOrderControls);
defineElement("dw-workspace-settings-form", WorkspaceSettingsForm);
defineElement("dw-invitation-accept-form", InvitationAcceptForm);
defineElement("dw-share-controls", ShareControls);
defineElement("dw-auth-panel", AuthPanel);
defineElement("dw-markdown-import-dialog", MarkdownImportDialog);
