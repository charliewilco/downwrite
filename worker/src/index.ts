import { handle as handleAstro } from "@astrojs/cloudflare/handler";
import { createApp } from "./app.js";
import {
  logMaintenanceFailure,
  logMaintenanceResult,
  runMaintenance,
} from "./maintenance.js";
import type { Env } from "./types.js";

export { createApp };

const app = createApp();
const WORKER_FIRST_PREFIXES = ["/api/", "/.well-known/", "/oauth/", "/mcp"];

function shouldUseHono(request: Request) {
  const { pathname } = new URL(request.url);
  return WORKER_FIRST_PREFIXES.some(
    (prefix) => pathname === prefix.slice(0, -1) || pathname.startsWith(prefix),
  );
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (shouldUseHono(request)) {
      return app.fetch(request, env, ctx);
    }

    return handleAstro(request, env, ctx);
  },
  scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      runMaintenance({ env })
        .then((result) => logMaintenanceResult(result))
        .catch((error: unknown) => logMaintenanceFailure(error)),
    );
  },
};
