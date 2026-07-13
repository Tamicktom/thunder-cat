//* Libraries imports
import { describe, expect, it } from "bun:test";

//* Local imports
import type { Sample } from "../collectors/types";
import { computeRangeStats, createEmptyRangeStats } from "./stats";

function makeSample(overrides: Partial<Sample> = {}): Sample {
  return {
    collected_at: 1_700_000_000_000,
    cpu_package_w: 40,
    cpu_core_w: 30,
    arc_card_w: 50,
    arc_pkg_w: 45,
    amd_igpu_w: 10,
    ram0_temp_c: 36,
    ram1_temp_c: 37,
    ...overrides,
  };
}

describe("computeRangeStats", () => {
  it("returns empty stats when there are no samples", () => {
    const stats = computeRangeStats([]);

    expect(stats).toEqual(createEmptyRangeStats());
  });

  it("computes latest, avg, min, and max for each metric", () => {
    const stats = computeRangeStats([
      makeSample({
        collected_at: 1000,
        cpu_package_w: 10,
        ram0_temp_c: 30,
      }),
      makeSample({
        collected_at: 2000,
        cpu_package_w: 30,
        ram0_temp_c: 40,
      }),
    ]);

    expect(stats.cpu_package_w).toEqual({
      latest: 30,
      avg: 20,
      min: 10,
      max: 30,
      count: 2,
    });
    expect(stats.ram0_temp_c).toEqual({
      latest: 40,
      avg: 35,
      min: 30,
      max: 40,
      count: 2,
    });
  });

  it("ignores null metric values when aggregating", () => {
    const stats = computeRangeStats([
      makeSample({
        collected_at: 1000,
        cpu_package_w: null,
        amd_igpu_w: 5,
      }),
      makeSample({
        collected_at: 2000,
        cpu_package_w: 20,
        amd_igpu_w: null,
      }),
      makeSample({
        collected_at: 3000,
        cpu_package_w: 40,
        amd_igpu_w: 15,
      }),
    ]);

    expect(stats.cpu_package_w).toEqual({
      latest: 40,
      avg: 30,
      min: 20,
      max: 40,
      count: 2,
    });
    expect(stats.amd_igpu_w).toEqual({
      latest: 15,
      avg: 10,
      min: 5,
      max: 15,
      count: 2,
    });
  });

  it("keeps null aggregates when every value for a metric is null", () => {
    const stats = computeRangeStats([
      makeSample({ arc_card_w: null }),
      makeSample({ arc_card_w: null }),
    ]);

    expect(stats.arc_card_w).toEqual({
      latest: null,
      avg: null,
      min: null,
      max: null,
      count: 0,
    });
  });
});
