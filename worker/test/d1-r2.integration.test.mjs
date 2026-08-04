import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { getPlatformProxy } from "wrangler";
import { createApp } from "../dist/app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workerRoot = path.resolve(__dirname, "..");

test("worker routes persist document metadata in D1 and Markdown content in R2", async () => {
  const proxy = await getPlatformProxy({
    configPath: path.join(workerRoot, "wrangler.toml"),
    envFiles: [],
    persist: false,
    remoteBindings: false,
  });

  try {
    await applyMigrations(proxy.env.DB);
    const app = createApp();
    const env = {
      ...proxy.env,
      DEVELOPMENT_API_TOKENS:
        "dev-owner:owner-token,dev-editor:editor-token,outsider:outsider-token",
    };

    const createdGroup = await json(
      await app.request(
        "https://example.downwrite.test/api/v1/groups",
        {
          method: "POST",
          headers: authHeaders("owner-token"),
          body: JSON.stringify({
            name: "Runtime workspace",
            description: "Backed by local D1",
          }),
        },
        env,
      ),
    );
    const groupId = createdGroup.group.id;

    const createdDocument = await json(
      await app.request(
        `https://example.downwrite.test/api/v1/groups/${groupId}/documents`,
        {
          method: "POST",
          headers: authHeaders("owner-token"),
          body: JSON.stringify({
            title: "Runtime document",
            content: "# Stored in R2\n\nThis came through the Worker API.",
          }),
        },
        env,
      ),
    );
    const documentId = createdDocument.document.id;

    const documentRow = await proxy.env.DB.prepare(
      `SELECT id, group_id, title, content_key, revision
      FROM documents
      WHERE id = ?`,
    )
      .bind(documentId)
      .first();
    const storedObject = await proxy.env.CONTENT.get(documentRow.content_key);
    const fetchedDocument = await json(
      await app.request(
        `https://example.downwrite.test/api/v1/documents/${documentId}`,
        { headers: authHeaders("owner-token") },
        env,
      ),
    );

    assert.equal(documentRow.group_id, groupId);
    assert.equal(documentRow.title, "Runtime document");
    assert.equal(documentRow.revision, 0);
    assert.equal(
      await storedObject.text(),
      "# Stored in R2\n\nThis came through the Worker API.",
    );
    assert.equal(
      fetchedDocument.document.content,
      "# Stored in R2\n\nThis came through the Worker API.",
    );
  } finally {
    await proxy.dispose();
  }
});

async function applyMigrations(db) {
  const migrationsDir = path.join(workerRoot, "migrations");
  const migrationFiles = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    const sql = await readFile(path.join(migrationsDir, file), "utf8");
    for (const statement of sqlStatements(sql)) {
      await db.prepare(statement).run();
    }
  }
}

function sqlStatements(sql) {
  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function json(response) {
  const body = await response.json();
  assert.ok(
    response.ok,
    `Expected ${response.url} to succeed, got ${response.status}: ${JSON.stringify(body)}`,
  );
  return body;
}

function authHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
}
