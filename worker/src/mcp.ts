import type { Context } from "hono";
import { HttpError, errorEnvelope } from "./http.js";
import { readIdentity } from "./identity.js";
import { assertScope } from "./oauth.js";
import type { Env, Role, Storage } from "./types.js";

type McpContext = Context<{ Bindings: Env }>;
type JsonRecord = Record<string, unknown>;
type JsonRpcId = string | number | null;

const PROTOCOL_VERSION = "2026-07-28";

const TOOLS = [
  {
    name: "list_workspaces",
    description:
      "List workspaces authorized for the current Downwrite identity.",
    inputSchema: objectSchema({}),
  },
  {
    name: "list_documents",
    description: "List Markdown documents in one authorized workspace.",
    inputSchema: objectSchema({
      groupId: { type: "string", description: "Workspace identifier." },
    }),
  },
  {
    name: "read_document",
    description: "Read one authorized Markdown document.",
    inputSchema: objectSchema({
      documentId: { type: "string", description: "Document identifier." },
    }),
  },
  {
    name: "create_document",
    description:
      "Create a Markdown document in an explicitly authorized workspace.",
    inputSchema: objectSchema({
      groupId: { type: "string", description: "Workspace identifier." },
      title: { type: "string", description: "Document title." },
      content: {
        type: "string",
        description: "UTF-8 Markdown source. Defaults to an empty string.",
      },
    }),
  },
  {
    name: "update_document",
    description:
      "Update an authorized Markdown document. Include baseRevision to avoid stale writes.",
    inputSchema: objectSchema({
      documentId: { type: "string", description: "Document identifier." },
      title: { type: "string", description: "Replacement title." },
      content: { type: "string", description: "Replacement Markdown source." },
      baseRevision: {
        type: "integer",
        minimum: 0,
        description: "Revision read by the client before editing.",
      },
    }),
  },
];

export async function handleMcpRequest(c: McpContext, storage: Storage) {
  let identity;
  try {
    identity = await readIdentity(c, storage);
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) {
      c.header("www-authenticate", bearerChallenge(c.req.url));
      return c.json(errorEnvelope(error), 401);
    }

    throw error;
  }

  assertScope(identity, "mcp:documents");

  let request: JsonRecord;
  try {
    const body: unknown = await c.req.json();
    if (Array.isArray(body) || body === null || typeof body !== "object") {
      return c.json(rpcError(null, -32600, "Invalid JSON-RPC request"), 400);
    }
    request = body as JsonRecord;
  } catch {
    return c.json(rpcError(null, -32700, "Parse error"), 400);
  }

  const id = jsonRpcId(request.id);
  if (typeof request.method !== "string") {
    return c.json(rpcError(id, -32600, "Invalid JSON-RPC request"), 400);
  }

  try {
    const result = await dispatchToolRequest({
      method: request.method,
      params: recordValue(request.params),
      storage,
      identityId: identity.id,
    });

    if (typeof request.id === "undefined") {
      return c.body(null, 204);
    }

    return c.json({ jsonrpc: "2.0", id, result });
  } catch (error) {
    if (error instanceof HttpError) {
      return c.json(rpcError(id, -32000, error.message, error), 200);
    }

    throw error;
  }
}

async function dispatchToolRequest(input: {
  method: string;
  params: JsonRecord;
  storage: Storage;
  identityId: string;
}) {
  if (input.method === "initialize") {
    return {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: { name: "downwrite", version: "1.0.0" },
    };
  }

  if (input.method === "tools/list") {
    return { tools: TOOLS };
  }

  if (input.method !== "tools/call") {
    throw new HttpError(400, `Unsupported MCP method: ${input.method}`);
  }

  const toolName = requireString(input.params, "name");
  const args = recordValue(input.params.arguments);
  const data = await callTool({
    toolName,
    args,
    storage: input.storage,
    identityId: input.identityId,
  });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

async function callTool(input: {
  toolName: string;
  args: JsonRecord;
  storage: Storage;
  identityId: string;
}) {
  switch (input.toolName) {
    case "list_workspaces": {
      const groups = await input.storage.listGroupsForIdentity(
        input.identityId,
      );
      return {
        workspaces: groups.map(({ documents, ...group }) => ({
          ...group,
          documentCount: documents.length,
        })),
      };
    }
    case "list_documents": {
      const groupId = requireString(input.args, "groupId");
      const groups = await input.storage.listGroupsForIdentity(
        input.identityId,
      );
      const group = groups.find((candidate) => candidate.id === groupId);
      if (!group) {
        throw new HttpError(404, "Workspace not found");
      }

      return { documents: group.documents };
    }
    case "read_document": {
      const document = await input.storage.getDocumentForIdentity({
        identityId: input.identityId,
        documentId: requireString(input.args, "documentId"),
      });
      if (!document) {
        throw new HttpError(404, "Document not found");
      }

      return { document };
    }
    case "create_document": {
      const document = await input.storage.createDocument({
        identityId: input.identityId,
        groupId: requireString(input.args, "groupId"),
        title: requireString(input.args, "title"),
        content: optionalString(input.args, "content") ?? "",
      });
      if (!document) {
        throw new HttpError(
          403,
          "You cannot create documents in this workspace",
        );
      }

      return { document };
    }
    case "update_document": {
      const documentId = requireString(input.args, "documentId");
      const current = await input.storage.getDocumentForIdentity({
        identityId: input.identityId,
        documentId,
      });
      if (!current || !canWrite(current.role)) {
        throw new HttpError(403, "You cannot edit this document");
      }

      const title = optionalString(input.args, "title") ?? undefined;
      const content = optionalText(input.args, "content");
      if (!title && typeof content === "undefined") {
        throw new HttpError(400, "Expected title or content");
      }

      const baseRevision = optionalNumber(input.args, "baseRevision");
      if (
        typeof baseRevision !== "undefined" &&
        Math.trunc(baseRevision) !== current.revision
      ) {
        throw new HttpError(409, "Document has changed since it was loaded");
      }

      const document = await input.storage.updateDocument({
        identityId: input.identityId,
        documentId,
        title,
        content,
      });
      if (!document) {
        throw new HttpError(403, "You cannot edit this document");
      }

      return { document };
    }
    default:
      throw new HttpError(400, `Unknown MCP tool: ${input.toolName}`);
  }
}

function bearerChallenge(url: string) {
  const origin = new URL(url).origin;
  return `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource", scope="mcp:documents"`;
}

function jsonRpcId(value: unknown): JsonRpcId {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    value === null ||
    typeof value === "undefined"
  ) {
    return value ?? null;
  }

  return null;
}

function rpcError(
  id: JsonRpcId,
  code: number,
  message: string,
  httpError?: HttpError,
) {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      data: httpError ? errorEnvelope(httpError) : undefined,
    },
  };
}

function requireString(body: JsonRecord, key: string) {
  const value = body[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, `Expected ${key} to be a non-empty string`);
  }

  return value.trim();
}

function optionalString(body: JsonRecord, key: string) {
  const value = body[key];
  if (typeof value === "undefined" || value === null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new HttpError(400, `Expected ${key} to be a string`);
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function optionalText(body: JsonRecord, key: string) {
  const value = body[key];
  if (typeof value === "undefined" || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new HttpError(400, `Expected ${key} to be a string`);
  }

  return value;
}

function optionalNumber(body: JsonRecord, key: string) {
  const value = body[key];
  if (typeof value === "undefined" || value === null) {
    return undefined;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new HttpError(400, `Expected ${key} to be a finite number`);
  }

  return value;
}

function recordValue(value: unknown): JsonRecord {
  if (value === null || typeof value === "undefined") {
    return {};
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as JsonRecord;
  }

  throw new HttpError(400, "Expected object parameters");
}

function canWrite(role: Role) {
  return role === "owner" || role === "editor";
}

function objectSchema(properties: Record<string, unknown>) {
  return {
    type: "object",
    additionalProperties: false,
    properties,
  };
}
