import { D1Storage } from "./storage/d1.js";
import type { CleanupResult, Env, Storage } from "./types.js";

export interface MaintenanceLogger {
  info(message: string, payload: unknown): void;
  error(message: string, payload: unknown): void;
}

export async function runMaintenance(input: {
  env: Env;
  now?: Date;
  storage?: Storage;
}): Promise<CleanupResult> {
  const storage =
    input.storage ?? new D1Storage(input.env.DB, input.env.CONTENT);
  return storage.cleanupExpiredRecords((input.now ?? new Date()).toISOString());
}

export function logMaintenanceResult(
  result: CleanupResult,
  logger: MaintenanceLogger = console,
) {
  logger.info("downwrite.maintenance.cleanup", {
    cleanup: result,
    deletedRecords: Object.values(result).reduce(
      (total, count) => total + count,
      0,
    ),
  });
}

export function logMaintenanceFailure(
  error: unknown,
  logger: MaintenanceLogger = console,
) {
  logger.error("downwrite.maintenance.failed", {
    error: error instanceof Error ? error.message : String(error),
  });
}
