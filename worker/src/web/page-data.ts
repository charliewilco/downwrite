import { env } from "cloudflare:workers";
import { assertScope } from "../oauth.js";
import { readIdentityFromRequest } from "../identity.js";
import { D1Storage } from "../storage/d1.js";
import type { DocumentRecord, Env, GroupSummary } from "../types.js";

function storage(bindings: Env) {
  return new D1Storage(bindings.DB, bindings.CONTENT);
}

async function readPageIdentity(request: Request) {
  return readIdentityFromRequest(
    {
      authorization: request.headers.get("authorization") ?? "",
      cookie: request.headers.get("cookie") ?? "",
      env: env as Env,
      url: request.url,
    },
    storage(env as Env),
  );
}

export async function loadGroupsForRequest(request: Request): Promise<{
  groups: GroupSummary[];
  error: string | null;
}> {
  const store = storage(env as Env);

  try {
    const identity = await readPageIdentity(request);
    assertScope(identity, "workspaces:read");
    return {
      groups: await store.listGroupsForIdentity(identity.id),
      error: null,
    };
  } catch (caught: unknown) {
    return {
      groups: [],
      error: caught instanceof Error ? caught.message : "Sign in to continue",
    };
  }
}

export async function loadGroupForRequest(
  request: Request,
  groupId: string,
): Promise<{
  group: GroupSummary | null;
  groups: GroupSummary[];
  error: string | null;
}> {
  const result = await loadGroupsForRequest(request);

  return {
    ...result,
    group: result.groups.find((group) => group.id === groupId) ?? null,
  };
}

export async function loadDocumentForRequest(
  request: Request,
  documentId: string,
): Promise<{
  document: DocumentRecord | null;
  groups: GroupSummary[];
  error: string | null;
}> {
  const store = storage(env as Env);
  const groups = await loadGroupsForRequest(request);

  try {
    const identity = await readPageIdentity(request);
    assertScope(identity, "documents:read");
    const document = await store.getDocumentForIdentity({
      identityId: identity.id,
      documentId,
    });

    return {
      document,
      groups: groups.groups,
      error: document ? null : "Document not found",
    };
  } catch (caught: unknown) {
    return {
      document: null,
      groups: groups.groups,
      error:
        caught instanceof Error ? caught.message : "Document request failed",
    };
  }
}

export async function loadPublicDocumentForRequest(publicToken: string) {
  const document = await storage(env as Env).getDocumentByPublicToken(
    publicToken,
  );

  return {
    document,
    error: document ? null : "This public link may have been revoked.",
  };
}
