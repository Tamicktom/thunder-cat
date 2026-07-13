//* Libraries imports
import { Elysia, t } from "elysia";
import type { Database } from "bun:sqlite";
import { join } from "node:path";

//* Local imports
import { getLastSampleAt, getSamplesInRange } from "../db/samples";
import type { HealthState } from "./health";
import { computeRangeStats } from "../ui/stats";
import { DashboardPage } from "../ui/dashboard";

const ONE_HOUR_MS = 60 * 60 * 1000;
const UI_LIMIT = 5_000;
const PUBLIC_DIR = join(import.meta.dir, "../../public");

export function parseTimeParam(
  value: string | number | undefined,
  fallback: number,
): number {
  if (value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function createDashboardRoutes(db: Database, state: HealthState) {
  return new Elysia({ name: "dashboard" })
    .get("/public/:file", ({ params, set }) => {
      const allowed = new Set(["dashboard.css", "dashboard.js"]);
      if (!allowed.has(params.file)) {
        set.status = 404;
        return "Not found";
      }

      return Bun.file(join(PUBLIC_DIR, params.file));
    })
    .get(
      "/",
      ({ query }) => {
        const toMs = parseTimeParam(query.to, Date.now());
        const fromMs = parseTimeParam(query.from, toMs - ONE_HOUR_MS);
        const rangeStart = Math.min(fromMs, toMs);
        const rangeEnd = Math.max(fromMs, toMs);

        const samples = getSamplesInRange(db, {
          from: rangeStart,
          to: rangeEnd,
          limit: UI_LIMIT,
        });
        const stats = computeRangeStats(samples);

        return DashboardPage({
          fromMs: rangeStart,
          toMs: rangeEnd,
          samples,
          stats,
          uptimeMs: Date.now() - state.startedAt,
          lastSampleAt: getLastSampleAt(db),
        });
      },
      {
        query: t.Object({
          from: t.Optional(t.Union([t.String(), t.Numeric()])),
          to: t.Optional(t.Union([t.String(), t.Numeric()])),
        }),
      },
    );
}
