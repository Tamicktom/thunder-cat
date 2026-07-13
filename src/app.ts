//* Libraries imports
import { Elysia } from "elysia";
import { cron, Patterns } from "@elysiajs/cron";
import { html } from "@elysia/html";
import type { Database } from "bun:sqlite";

//* Local imports
import { collectSample, createCollectors, type Collectors } from "./collectors";
import { insertSample } from "./db/samples";
import { createHealthRoutes, type HealthState } from "./routes/health";
import { createSamplesRoutes } from "./routes/samples";
import { createDashboardRoutes } from "./routes/dashboard";

export type AppOptions = {
  db: Database;
  collectors?: Collectors;
  enableCron?: boolean;
  startedAt?: number;
};

export function createApp(options: AppOptions) {
  const collectors = options.collectors ?? createCollectors();
  const enableCron = options.enableCron ?? true;
  const state: HealthState = {
    startedAt: options.startedAt ?? Date.now(),
  };

  let app = new Elysia()
    .use(html())
    .get("/api", () => ({
      name: "thunder-cat",
      version: "1.0.0",
      endpoints: ["/", "/health", "/samples/latest", "/samples"],
    }))
    .use(createDashboardRoutes(options.db, state))
    .use(createHealthRoutes(options.db, state))
    .use(createSamplesRoutes(options.db));

  if (enableCron) {
    app.use(
      cron({
        name: "collect-power-sample",
        pattern: Patterns.everySeconds(5),
        catch: true,
        run() {
          try {
            const sample = collectSample(collectors);
            insertSample(options.db, sample);
          } catch (error) {
            console.error("[thunder-cat] failed to collect sample", error);
          }
        },
      }),
    );
  }

  return app;
}
