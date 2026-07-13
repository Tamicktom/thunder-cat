//* Libraries imports
import { afterAll, describe, expect, it } from "bun:test";

//* Local imports
import { createApp } from "../app";
import { closeDatabase, openDatabase } from "../db/client";
import { insertSample, getLatestSample, getSamplesInRange } from "../db/samples";
import type { Sample } from "../collectors/types";

function makeSample(overrides: Partial<Sample> = {}): Sample {
  return {
    collected_at: 1_700_000_000_000,
    cpu_package_w: 42,
    cpu_core_w: 30,
    arc_card_w: 55,
    arc_pkg_w: 50,
    amd_igpu_w: 11,
    ram0_temp_c: 37,
    ram1_temp_c: 38,
    ...overrides,
  };
}

describe("samples repository", () => {
  const db = openDatabase(":memory:");

  afterAll(() => {
    closeDatabase(db);
  });

  it("inserts a sample and returns it as the latest", () => {
    insertSample(db, makeSample());
    const latest = getLatestSample(db);

    expect(latest).not.toBeNull();
    expect(latest?.cpu_package_w).toBe(42);
    expect(latest?.ram1_temp_c).toBe(38);
  });

  it("queries samples inside a time range", () => {
    insertSample(db, makeSample({ collected_at: 1000, cpu_package_w: 10 }));
    insertSample(db, makeSample({ collected_at: 2000, cpu_package_w: 20 }));
    insertSample(db, makeSample({ collected_at: 3000, cpu_package_w: 30 }));

    const rows = getSamplesInRange(db, { from: 1500, to: 2500, limit: 100 });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.cpu_package_w).toBe(20);
  });
});

describe("HTTP API", () => {
  const db = openDatabase(":memory:");
  const app = createApp({ db, enableCron: false, startedAt: 1_000 });

  afterAll(() => {
    closeDatabase(db);
  });

  it("returns health payload", async () => {
    const response = await app.handle(new Request("http://localhost/health"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(typeof body.uptimeMs).toBe("number");
  });

  it("returns null when there is no latest sample", async () => {
    const response = await app.handle(
      new Request("http://localhost/samples/latest"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.sample).toBeNull();
  });

  it("returns inserted samples for a range query", async () => {
    insertSample(db, makeSample({ collected_at: 5_000, cpu_package_w: 15 }));

    const response = await app.handle(
      new Request("http://localhost/samples?from=0&to=10000&limit=10"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.count).toBe(1);
    expect(body.samples[0].cpu_package_w).toBe(15);
  });

  it("returns the latest sample after insert", async () => {
    insertSample(db, makeSample({ collected_at: 9_000, amd_igpu_w: 12.5 }));

    const response = await app.handle(
      new Request("http://localhost/samples/latest"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.sample.amd_igpu_w).toBe(12.5);
  });
});
