//* Libraries imports
import { afterAll, describe, expect, it } from "bun:test";

//* Local imports
import { createApp } from "../app";
import { closeDatabase, openDatabase } from "../db/client";
import { insertSample } from "../db/samples";
import type { Sample } from "../collectors/types";
import { parseTimeParam } from "./dashboard";

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

describe("parseTimeParam", () => {
  it("returns the fallback when the value is missing", () => {
    expect(parseTimeParam(undefined, 100)).toBe(100);
    expect(parseTimeParam("", 100)).toBe(100);
  });

  it("parses unix millisecond strings and numbers", () => {
    expect(parseTimeParam(1_700_000_000_000, 0)).toBe(1_700_000_000_000);
    expect(parseTimeParam("1700000000000", 0)).toBe(1_700_000_000_000);
  });

  it("parses datetime-local strings", () => {
    const parsed = parseTimeParam("2024-01-15T12:30", 0);
    expect(parsed).toBe(Date.parse("2024-01-15T12:30"));
  });
});

describe("dashboard route", () => {
  const db = openDatabase(":memory:");
  const app = createApp({ db, enableCron: false, startedAt: 1_000 });

  afterAll(() => {
    closeDatabase(db);
  });

  it("returns an HTML dashboard for the root path", async () => {
    insertSample(db, makeSample({ collected_at: Date.now() - 1_000 }));

    const response = await app.handle(new Request("http://localhost/"));
    const body = await response.text();
    const contentType = response.headers.get("content-type") ?? "";

    expect(response.status).toBe(200);
    expect(contentType.includes("text/html")).toBe(true);
    expect(body).toContain("Thunder-Cat");
    expect(body).toContain("power-chart");
  });

  it("exposes API metadata at /api", async () => {
    const response = await app.handle(new Request("http://localhost/api"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.name).toBe("thunder-cat");
    expect(body.endpoints).toContain("/");
  });
});
