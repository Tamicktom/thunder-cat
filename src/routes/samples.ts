//* Libraries imports
import { Elysia, t } from "elysia";
import type { Database } from "bun:sqlite";

//* Local imports
import { getLatestSample, getSamplesInRange } from "../db/samples";

const ONE_HOUR_MS = 60 * 60 * 1000;
const DEFAULT_LIMIT = 1000;
const MAX_LIMIT = 10_000;

export function createSamplesRoutes(db: Database) {
  return new Elysia({ name: "samples" })
    .get("/samples/latest", () => {
      const sample = getLatestSample(db);
      if (sample === null) {
        return { sample: null };
      }
      return { sample };
    })
    .get(
      "/samples",
      ({ query }) => {
        const to = query.to ?? Date.now();
        const from = query.from ?? to - ONE_HOUR_MS;
        const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

        const samples = getSamplesInRange(db, { from, to, limit });

        return {
          from,
          to,
          limit,
          count: samples.length,
          samples,
        };
      },
      {
        query: t.Object({
          from: t.Optional(t.Numeric()),
          to: t.Optional(t.Numeric()),
          limit: t.Optional(t.Numeric()),
        }),
      },
    );
}
