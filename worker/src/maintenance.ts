import { D1Storage } from "./storage/d1.js";
import type { CleanupResult, Env, Storage } from "./types.js";

export async function runMaintenance(input: {
  env: Env;
  now?: Date;
  storage?: Storage;
}): Promise<CleanupResult> {
  const storage =
    input.storage ?? new D1Storage(input.env.DB, input.env.CONTENT);
  return storage.cleanupExpiredRecords((input.now ?? new Date()).toISOString());
}
