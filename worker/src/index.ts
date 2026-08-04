import { createApp } from "./app.js";
import { runMaintenance } from "./maintenance.js";
import type { Env } from "./types.js";

export { createApp };

const app = createApp();

export default {
  fetch: app.fetch,
  scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runMaintenance({ env }));
  },
};
