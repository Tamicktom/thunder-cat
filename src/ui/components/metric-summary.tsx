//* Libraries imports
import { Html } from "@elysia/html";

//* Local imports
import type { MetricKey, MetricStats, RangeStats } from "../stats";

export type MetricSummaryProps = {
  stats: RangeStats;
  sampleCount: number;
};

const METRIC_LABELS: Record<MetricKey, string> = {
  cpu_package_w: "CPU package",
  cpu_core_w: "CPU core",
  arc_card_w: "Arc card",
  arc_pkg_w: "Arc package",
  amd_igpu_w: "AMD iGPU",
  ram0_temp_c: "RAM 0",
  ram1_temp_c: "RAM 1",
};

const POWER_KEYS: MetricKey[] = [
  "cpu_package_w",
  "cpu_core_w",
  "arc_card_w",
  "arc_pkg_w",
  "amd_igpu_w",
];

const TEMP_KEYS: MetricKey[] = ["ram0_temp_c", "ram1_temp_c"];

function formatValue(value: number | null, unit: string): string {
  if (value === null) {
    return "—";
  }
  return `${value.toFixed(1)}${unit}`;
}

function MetricBlock(props: {
  label: string;
  stats: MetricStats;
  unit: string;
}) {
  return (
    <div class="metric">
      <p class="metric-label">{props.label}</p>
      <p class="metric-latest">{formatValue(props.stats.latest, props.unit)}</p>
      <dl class="metric-range">
        <div>
          <dt>avg</dt>
          <dd>{formatValue(props.stats.avg, props.unit)}</dd>
        </div>
        <div>
          <dt>min</dt>
          <dd>{formatValue(props.stats.min, props.unit)}</dd>
        </div>
        <div>
          <dt>max</dt>
          <dd>{formatValue(props.stats.max, props.unit)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function MetricSummary(props: MetricSummaryProps) {
  return (
    <section class="summary" aria-label="Metric summary">
      <header class="section-header">
        <h2>Summary</h2>
        <p>
          {props.sampleCount} sample{props.sampleCount === 1 ? "" : "s"} in range
        </p>
      </header>

      <div class="summary-group">
        <h3>Power</h3>
        <div class="metric-grid">
          {POWER_KEYS.map((key) => (
            <MetricBlock
              label={METRIC_LABELS[key]}
              stats={props.stats[key]}
              unit=" W"
            />
          ))}
        </div>
      </div>

      <div class="summary-group">
        <h3>Temperature</h3>
        <div class="metric-grid">
          {TEMP_KEYS.map((key) => (
            <MetricBlock
              label={METRIC_LABELS[key]}
              stats={props.stats[key]}
              unit=" °C"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
