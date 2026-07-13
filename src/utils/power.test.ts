//* Libraries imports
import { describe, expect, it } from "bun:test";

//* Local imports
import { milliCelsiusToCelsius, microWattsToWatts, powerFromEnergyDelta } from "./power";

describe("powerFromEnergyDelta", () => {
  it("returns null watts on the first sample and stores the snapshot", () => {
    const result = powerFromEnergyDelta(null, 1_000_000, 1000, 1 / 1_000_000);

    expect(result.watts).toBeNull();
    expect(result.snapshot).toEqual({ energy: 1_000_000, timestampMs: 1000 });
  });

  it("computes average watts from energy delta over time", () => {
    const previous = { energy: 1_000_000, timestampMs: 0 };
    const result = powerFromEnergyDelta(previous, 6_000_000, 1000, 1 / 1_000_000);

    // 5 joules in 1 second => 5 W
    expect(result.watts).toBe(5);
  });

  it("returns null watts when the counter wraps", () => {
    const previous = { energy: 9_000_000, timestampMs: 0 };
    const result = powerFromEnergyDelta(previous, 1_000_000, 1000, 1 / 1_000_000);

    expect(result.watts).toBeNull();
    expect(result.snapshot.energy).toBe(1_000_000);
  });

  it("returns null watts when timestamps do not advance", () => {
    const previous = { energy: 1_000_000, timestampMs: 1000 };
    const result = powerFromEnergyDelta(previous, 2_000_000, 1000, 1 / 1_000_000);

    expect(result.watts).toBeNull();
  });
});

describe("unit conversions", () => {
  it("converts microwatts to watts", () => {
    expect(microWattsToWatts(11_000_000)).toBe(11);
  });

  it("converts millicelsius to celsius", () => {
    expect(milliCelsiusToCelsius(37500)).toBe(37.5);
  });
});
