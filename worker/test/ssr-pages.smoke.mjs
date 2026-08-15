import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

const previewOrigin = "http://127.0.0.1:4331";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

const routes = [
  {
    path: "/",
    snippets: ["Downwrite", '<main class="shell"'],
  },
  {
    path: "/new/workspace",
    snippets: ["Start a writing space.", '<main class="shell"'],
  },
  {
    path: "/new/document",
    snippets: ["Choose where it belongs.", '<main class="shell"'],
  },
  {
    path: "/documents/missing",
    snippets: ["Document not found", '<main class="shell"'],
  },
  {
    path: "/public/missing",
    snippets: ["Public document unavailable", '<main class="shell"'],
  },
  {
    path: "/invitations/missing",
    snippets: ["Accept a document invitation.", '<main class="shell"'],
  },
  {
    path: "/workspaces/missing/settings",
    snippets: ["Workspace Settings - Downwrite", '<main class="shell"'],
  },
  {
    path: "/workspaces/missing/share",
    snippets: ["Sharing - Downwrite", '<main class="shell"'],
  },
];

test("Astro SSR page routes return shell HTML with route content", async () => {
  await stopPreview();
  await startPreview();

  try {
    for (const route of routes) {
      const response = await fetch(`${previewOrigin}${route.path}`);
      const html = await response.text();

      assert.equal(response.status, 200, route.path);
      assert.match(
        response.headers.get("content-type") ?? "",
        /^text\/html/,
        route.path,
      );
      assert.doesNotMatch(
        html,
        /Internal Server Error|ErrorOverlay/,
        route.path,
      );

      for (const snippet of route.snippets) {
        assert.ok(html.includes(snippet), `${route.path} includes ${snippet}`);
      }
    }
  } finally {
    await stopPreview();
  }
});

async function startPreview() {
  execFileSync(
    npx,
    ["astro", "preview", "--host", "127.0.0.1", "--port", "4331"],
    {
      cwd: process.cwd(),
      stdio: "pipe",
    },
  );
  await waitForPreview();
}

async function stopPreview() {
  try {
    execFileSync(npx, ["astro", "preview", "stop"], {
      cwd: process.cwd(),
      stdio: "ignore",
    });
  } catch {
    // No preview server is running.
  }
}

async function waitForPreview() {
  const deadline = Date.now() + 10_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(previewOrigin);
      if (response.ok) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error("Astro preview did not become ready");
}
