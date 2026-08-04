import { createApp } from "./app.js";
import {
  logMaintenanceFailure,
  logMaintenanceResult,
  runMaintenance,
} from "./maintenance.js";
import type { Env } from "./types.js";

export { createApp };

const app = createApp();

export default {
  fetch: app.fetch,
  scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      runMaintenance({ env })
        .then((result) => logMaintenanceResult(result))
        .catch((error: unknown) => logMaintenanceFailure(error)),
    );
  },
};
