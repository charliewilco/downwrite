export class MemoryStorage {
  #groupCounter = 0;
  #documentCounter = 0;
  #publicLinkCounter = 0;
  #invitationCounter = 0;
  #challengeCounter = 0;
  #sessionCounter = 0;
  #credentialCounter = 0;
  #identities = new Map();
  #credentials = new Map();
  #challenges = new Map();
  #sessions = new Map();
  #groups = new Map();
  #groupMembers = new Map();
  #documents = new Map();
  #documentCollaborators = new Map();
  #invitations = new Map();
  #publicLinksByToken = new Map();
  #publicLinksById = new Map();
  #rateLimits = new Map();

  async hasAnyIdentity() {
    return this.#credentials.size > 0;
  }

  async getIdentity(identityId) {
    return this.#identities.get(identityId) ?? null;
  }

  async listCredentialsForIdentity(identityId) {
    return [...this.#credentials.values()].filter(
      (credential) => credential.identityId === identityId,
    );
  }

  async getCredentialByCredentialId(credentialId) {
    return (
      [...this.#credentials.values()].find(
        (credential) => credential.credentialId === credentialId,
      ) ?? null
    );
  }

  async createWebAuthnChallenge({ identityId, type, challenge }) {
    this.#ensureIdentity(identityId);
    const record = {
      id: `challenge-${++this.#challengeCounter}`,
      identityId,
      type,
      challenge,
      createdAt: now(),
    };
    this.#challenges.set(record.id, record);
    return record;
  }

  async getWebAuthnChallenge({ challengeId, type }) {
    const challenge = this.#challenges.get(challengeId);
    return challenge?.type === type ? challenge : null;
  }

  async deleteWebAuthnChallenge(challengeId) {
    this.#challenges.delete(challengeId);
  }

  async createIdentityWithCredential({
    identityId,
    displayName,
    credentialId,
    publicKey,
    counter,
    transports,
  }) {
    const identity = {
      id: identityId,
      displayName,
      createdAt: now(),
    };
    this.#identities.set(identityId, identity);
    await this.addCredential({
      identityId,
      credentialId,
      publicKey,
      counter,
      transports,
    });
    return identity;
  }

  async addCredential({
    identityId,
    credentialId,
    publicKey,
    counter,
    transports,
  }) {
    const credential = {
      id: `credential-${++this.#credentialCounter}`,
      identityId,
      credentialId,
      publicKey,
      counter,
      transports,
      createdAt: now(),
    };
    this.#credentials.set(credential.id, credential);
    return credential;
  }

  async updateCredentialCounter({ credentialId, counter }) {
    const credential = await this.getCredentialByCredentialId(credentialId);
    if (credential) {
      credential.counter = counter;
    }
  }

  async createSession({ identityId, tokenHash, expiresAt }) {
    const session = {
      id: `session-${++this.#sessionCounter}`,
      identityId,
      tokenHash,
      createdAt: now(),
      expiresAt,
    };
    this.#sessions.set(tokenHash, session);
    return stripTokenHash(session);
  }

  async getSessionByTokenHash(tokenHash) {
    const session = this.#sessions.get(tokenHash);
    return session ? stripTokenHash(session) : null;
  }

  async deleteSessionByTokenHash(tokenHash) {
    this.#sessions.delete(tokenHash);
  }

  async consumeRateLimit({ key, limit, windowSeconds }) {
    const current = this.#rateLimits.get(key);
    const nowMs = Date.now();

    if (!current || current.resetAt <= nowMs) {
      this.#rateLimits.set(key, {
        count: 1,
        resetAt: nowMs + windowSeconds * 1000,
      });
      return true;
    }

    if (current.count >= limit) {
      return false;
    }

    current.count += 1;
    return true;
  }

  async listGroupsForIdentity(identityId) {
    const groups = [];

    for (const group of this.#groups.values()) {
      const groupRole = this.#groupMembers.get(key(group.id, identityId));
      const documents = [];

      for (const document of this.#documents.values()) {
        if (document.groupId !== group.id) {
          continue;
        }

        const documentRole = this.#documentCollaborators.get(
          key(document.id, identityId),
        );
        const role = documentRole ?? groupRole;

        if (role) {
          documents.push(toDocumentSummary(document, role));
        }
      }

      if (groupRole || documents.length > 0) {
        groups.push({
          ...group,
          role: groupRole ?? "editor",
          documents: documents.sort(compareDocuments),
        });
      }
    }

    return groups.sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    );
  }

  async createGroup({ identityId, name, description, accentColor }) {
    this.#ensureIdentity(identityId);
    const timestamp = now();
    const group = {
      id: `group-${++this.#groupCounter}`,
      name,
      description,
      accentColor,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.#groups.set(group.id, group);
    this.#groupMembers.set(key(group.id, identityId), "owner");

    return {
      ...group,
      role: "owner",
      documents: [],
    };
  }

  async updateGroup({ identityId, groupId, name, description, accentColor }) {
    const role = this.#groupMembers.get(key(groupId, identityId));
    if (role !== "owner") {
      return null;
    }
    const group = this.#groups.get(groupId);
    if (!group) {
      return null;
    }

    const next = {
      ...group,
      name: name ?? group.name,
      description:
        typeof description === "undefined" ? group.description : description,
      accentColor:
        typeof accentColor === "undefined" ? group.accentColor : accentColor,
      updatedAt: now(),
    };
    this.#groups.set(groupId, next);
    return {
      ...next,
      role,
      documents: [],
    };
  }

  async deleteGroup({ identityId, groupId }) {
    const role = this.#groupMembers.get(key(groupId, identityId));
    if (role !== "owner") {
      return false;
    }

    this.#groups.delete(groupId);
    for (const document of this.#documents.values()) {
      if (document.groupId === groupId) {
        this.#documents.delete(document.id);
      }
    }
    return true;
  }

  async createDocument({ identityId, groupId, title, content }) {
    const role = this.#groupMembers.get(key(groupId, identityId));

    if (!role) {
      return null;
    }

    const timestamp = now();
    const position = this.#nextDocumentPosition(groupId);
    const document = {
      id: `doc-${++this.#documentCounter}`,
      groupId,
      title,
      content,
      position,
      revision: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.#documents.set(document.id, document);
    this.#documentCollaborators.set(key(document.id, identityId), "owner");
    this.#touchGroup(groupId);

    return {
      ...document,
      role: "owner",
    };
  }

  async getDocumentForIdentity({ identityId, documentId }) {
    const document = this.#documents.get(documentId);

    if (!document) {
      return null;
    }

    const role =
      this.#documentCollaborators.get(key(documentId, identityId)) ??
      this.#groupMembers.get(key(document.groupId, identityId));

    if (!role) {
      return null;
    }

    return {
      ...document,
      role,
    };
  }

  async updateDocument({ identityId, documentId, title, content }) {
    const current = await this.getDocumentForIdentity({
      identityId,
      documentId,
    });

    if (!current || !canWrite(current.role)) {
      return null;
    }

    const next = {
      ...current,
      title: title ?? current.title,
      content: content ?? current.content,
      revision: current.revision + 1,
      updatedAt: now(),
    };

    this.#documents.set(documentId, stripRole(next));
    this.#touchGroup(current.groupId);
    return next;
  }

  async moveDocument({ identityId, documentId, groupId, position }) {
    const current = await this.getDocumentForIdentity({
      identityId,
      documentId,
    });
    const targetRole = this.#groupMembers.get(key(groupId, identityId));

    if (!current || !canWrite(current.role) || !targetRole) {
      return null;
    }

    const next = {
      ...current,
      groupId,
      position:
        typeof position === "undefined"
          ? this.#nextDocumentPosition(groupId)
          : Math.trunc(position),
      revision: current.revision + 1,
      updatedAt: now(),
    };
    this.#documents.set(documentId, stripRole(next));
    this.#touchGroup(current.groupId);
    this.#touchGroup(groupId);
    return next;
  }

  async positionDocument({ identityId, documentId, position }) {
    const current = await this.getDocumentForIdentity({
      identityId,
      documentId,
    });

    if (!current || !canWrite(current.role)) {
      return null;
    }

    const next = {
      ...current,
      position: Math.trunc(position),
      revision: current.revision + 1,
      updatedAt: now(),
    };
    this.#documents.set(documentId, stripRole(next));
    this.#touchGroup(current.groupId);
    return next;
  }

  async deleteDocument({ identityId, documentId }) {
    const current = await this.getDocumentForIdentity({
      identityId,
      documentId,
    });

    if (!current || !canWrite(current.role)) {
      return false;
    }

    this.#documents.delete(documentId);
    this.#documentCollaborators.delete(key(documentId, identityId));
    this.#touchGroup(current.groupId);

    return true;
  }

  async addDocumentCollaborator({
    identityId,
    documentId,
    collaboratorIdentityId,
    role,
  }) {
    const current = await this.getDocumentForIdentity({
      identityId,
      documentId,
    });

    if (!current || current.role !== "owner") {
      return;
    }

    this.#ensureIdentity(collaboratorIdentityId);
    this.#documentCollaborators.set(
      key(documentId, collaboratorIdentityId),
      role,
    );
  }

  async removeDocumentCollaborator({
    identityId,
    documentId,
    collaboratorIdentityId,
  }) {
    const current = await this.getDocumentForIdentity({
      identityId,
      documentId,
    });

    if (!current || current.role !== "owner") {
      return false;
    }

    this.#documentCollaborators.delete(key(documentId, collaboratorIdentityId));
    return true;
  }

  async createDocumentInvitation({
    identityId,
    documentId,
    invitedIdentityId,
    role,
    token,
  }) {
    const current = await this.getDocumentForIdentity({
      identityId,
      documentId,
    });
    if (!current || current.role !== "owner") {
      return null;
    }

    this.#ensureIdentity(invitedIdentityId);
    const invitation = {
      id: `invitation-${++this.#invitationCounter}`,
      documentId,
      invitedIdentityId,
      role,
      token,
      status: "pending",
      createdByIdentityId: identityId,
      createdAt: now(),
      acceptedAt: null,
      revokedAt: null,
    };
    this.#invitations.set(invitation.id, invitation);
    return invitation;
  }

  async acceptDocumentInvitation({ identityId, token }) {
    const invitation =
      [...this.#invitations.values()].find((item) => item.token === token) ??
      null;

    if (
      !invitation ||
      invitation.status !== "pending" ||
      invitation.invitedIdentityId !== identityId
    ) {
      return null;
    }

    const next = {
      ...invitation,
      status: "accepted",
      acceptedAt: now(),
    };
    this.#invitations.set(next.id, next);
    this.#documentCollaborators.set(
      key(invitation.documentId, identityId),
      invitation.role,
    );
    return next;
  }

  async revokeDocumentInvitation({ identityId, invitationId }) {
    const invitation = this.#invitations.get(invitationId);
    if (!invitation) {
      return false;
    }
    const current = await this.getDocumentForIdentity({
      identityId,
      documentId: invitation.documentId,
    });
    if (!current || current.role !== "owner") {
      return false;
    }

    this.#invitations.set(invitationId, {
      ...invitation,
      status: "revoked",
      revokedAt: now(),
    });
    return true;
  }

  async getDocumentShareState({ identityId, documentId }) {
    const current = await this.getDocumentForIdentity({
      identityId,
      documentId,
    });
    if (!current || current.role !== "owner") {
      return null;
    }

    return {
      documentId,
      collaborators: [...this.#documentCollaborators.entries()]
        .filter(([collaboratorKey]) =>
          collaboratorKey.startsWith(`${documentId}:`),
        )
        .map(([collaboratorKey, role]) => {
          const identity = collaboratorKey.split(":")[1];
          return {
            identityId: identity,
            displayName: this.#identities.get(identity)?.displayName ?? null,
            role,
            createdAt: now(),
          };
        }),
      invitations: [...this.#invitations.values()].filter(
        (invitation) => invitation.documentId === documentId,
      ),
      publicLinks: [...this.#publicLinksById.values()].filter(
        (link) => link.documentId === documentId,
      ),
    };
  }

  async createPublicLink({ identityId, documentId, label, token }) {
    const current = await this.getDocumentForIdentity({
      identityId,
      documentId,
    });

    if (!current) {
      return null;
    }

    const publicLink = {
      id: `public-link-${++this.#publicLinkCounter}`,
      documentId,
      token,
      label,
      active: true,
      createdAt: now(),
    };

    this.#publicLinksByToken.set(token, publicLink);
    this.#publicLinksById.set(publicLink.id, publicLink);
    return publicLink;
  }

  async updatePublicLink({ identityId, publicLinkId, label, active }) {
    const link = this.#publicLinksById.get(publicLinkId);
    if (!link) {
      return null;
    }
    const current = await this.getDocumentForIdentity({
      identityId,
      documentId: link.documentId,
    });

    if (!current || current.role !== "owner") {
      return null;
    }

    const next = {
      ...link,
      label: typeof label === "undefined" ? link.label : label,
      active: typeof active === "undefined" ? link.active : active,
    };
    this.#publicLinksById.set(publicLinkId, next);
    this.#publicLinksByToken.set(next.token, next);
    return next;
  }

  async getDocumentByPublicToken(token) {
    const publicLink = this.#publicLinksByToken.get(token);

    if (!publicLink || !publicLink.active) {
      return null;
    }

    const document = this.#documents.get(publicLink.documentId);

    if (!document) {
      return null;
    }

    return {
      ...document,
      publicLink: {
        token: publicLink.token,
        label: publicLink.label,
      },
    };
  }

  #ensureIdentity(identityId) {
    if (!this.#identities.has(identityId)) {
      this.#identities.set(identityId, {
        id: identityId,
        displayName: identityId,
        createdAt: now(),
      });
    }
  }

  #nextDocumentPosition(groupId) {
    return (
      Math.max(
        0,
        ...[...this.#documents.values()]
          .filter((document) => document.groupId === groupId)
          .map((document) => document.position),
      ) + 1000
    );
  }

  #touchGroup(groupId) {
    const group = this.#groups.get(groupId);
    if (group) {
      this.#groups.set(groupId, { ...group, updatedAt: now() });
    }
  }
}

function now() {
  return new Date().toISOString();
}

function key(left, right) {
  return `${left}:${right}`;
}

function toDocumentSummary(document, role) {
  const { content, ...summary } = document;
  return {
    ...summary,
    role,
  };
}

function stripRole(document) {
  const { role, ...record } = document;
  return record;
}

function stripTokenHash(session) {
  const { tokenHash, ...record } = session;
  return record;
}

function compareDocuments(left, right) {
  return (
    left.position - right.position ||
    right.updatedAt.localeCompare(left.updatedAt)
  );
}

function canWrite(role) {
  return role === "owner" || role === "editor";
}
