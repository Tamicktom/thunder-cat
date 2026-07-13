//* Libraries imports
import { Html } from "@elysia/html";

//* Local imports
import type { SampleRow } from "../db/samples";
import type { RangeStats } from "./stats";
import { Layout } from "./layout";
import { DateFilter } from "./components/date-filter";
import { MetricSummary } from "./components/metric-summary";
import { Charts } from "./components/charts";

export type DashboardPageProps = {
  fromMs: number;
  toMs: number;
  samples: SampleRow[];
  stats: RangeStats;
  uptimeMs: number;
  lastSampleAt: number | null;
};

function formatUptime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function formatTimestamp(ms: number | null): string {
  if (ms === null) {
    return "no samples yet";
  }
  return new Date(ms).toLocaleString();
}

export function DashboardPage(props: DashboardPageProps) {
  return (
    <Layout title="Thunder-Cat">
      <header class="hero">
        <p class="eyebrow">power monitor</p>
        <h1>Thunder-Cat</h1>
        <p class="lede">
          Live sensor summary for this machine — package power, discrete GPU,
          iGPU, and RAM temperatures.
        </p>
        <p class="status">
          uptime {formatUptime(props.uptimeMs)} · last sample{" "}
          {formatTimestamp(props.lastSampleAt)}
        </p>
      </header>

      <DateFilter fromMs={props.fromMs} toMs={props.toMs} />
      <MetricSummary stats={props.stats} sampleCount={props.samples.length} />
      <Charts samples={props.samples} />
    </Layout>
  );
}
