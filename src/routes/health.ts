//* Libraries imports
import { Elysia } from "elysia";
import type { Database } from "bun:sqlite";

//* Local imports
import { getLastSampleAt } from "../db/samples";

export type HealthState = {
  startedAt: number;
};

export function createHealthRoutes(db: Database, state: HealthState) {
  return new Elysia({ name: "health" }).get("/health", () => {
    return {
      ok: true,
      uptimeMs: Date.now() - state.startedAt,
      lastSampleAt: getLastSampleAt(db),
    };
  });
}
