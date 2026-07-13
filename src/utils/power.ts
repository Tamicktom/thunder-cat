//* Local imports
import type { EnergySnapshot, PowerFromEnergyResult } from "../collectors/types";

/**
 * Convert cumulative energy counters into average watts between two samples.
 * Energy unit must match between readings (e.g. microjoules).
 * Handles counter wrap by returning null for that interval.
 */
export function powerFromEnergyDelta(
  previous: EnergySnapshot | null,
  currentEnergy: number,
  currentTimestampMs: number,
  energyScaleToJoules: number,
): PowerFromEnergyResult {
  const snapshot: EnergySnapshot = {
    energy: currentEnergy,
    timestampMs: currentTimestampMs,
  };

  if (previous === null) {
    return { watts: null, snapshot };
  }

  const deltaEnergy = currentEnergy - previous.energy;
  const deltaSeconds = (currentTimestampMs - previous.timestampMs) / 1000;

  if (deltaSeconds <= 0 || deltaEnergy < 0) {
    return { watts: null, snapshot };
  }

  const joules = deltaEnergy * energyScaleToJoules;
  const watts = joules / deltaSeconds;

  if (!Number.isFinite(watts)) {
    return { watts: null, snapshot };
  }

  return { watts, snapshot };
}

export function microWattsToWatts(microWatts: number): number {
  return microWatts / 1_000_000;
}

export function milliCelsiusToCelsius(milliCelsius: number): number {
  return milliCelsius / 1000;
}
