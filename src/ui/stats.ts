//* Local imports
import type { Sample } from "../collectors/types";

export const METRIC_KEYS = [
  "cpu_package_w",
  "cpu_core_w",
  "arc_card_w",
  "arc_pkg_w",
  "amd_igpu_w",
  "ram0_temp_c",
  "ram1_temp_c",
] as const;

export type MetricKey = (typeof METRIC_KEYS)[number];

export type MetricStats = {
  latest: number | null;
  avg: number | null;
  min: number | null;
  max: number | null;
  count: number;
};

export type RangeStats = Record<MetricKey, MetricStats>;

function emptyMetricStats(): MetricStats {
  return {
    latest: null,
    avg: null,
    min: null,
    max: null,
    count: 0,
  };
}

export function createEmptyRangeStats(): RangeStats {
  const stats = {} as RangeStats;
  for (const key of METRIC_KEYS) {
    stats[key] = emptyMetricStats();
  }
  return stats;
}

export function computeRangeStats(samples: Sample[]): RangeStats {
  const stats = createEmptyRangeStats();

  if (samples.length === 0) {
    return stats;
  }

  for (const key of METRIC_KEYS) {
    let sum = 0;
    let count = 0;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let latest: number | null = null;

    for (const sample of samples) {
      const value = sample[key];
      if (value === null || value === undefined || Number.isNaN(value)) {
        continue;
      }

      sum += value;
      count += 1;
      if (value < min) {
        min = value;
      }
      if (value > max) {
        max = value;
      }
      latest = value;
    }

    stats[key] = {
      latest,
      avg: count === 0 ? null : sum / count,
      min: count === 0 ? null : min,
      max: count === 0 ? null : max,
      count,
    };
  }

  return stats;
}
