//* Libraries imports
import { Html } from "@elysia/html";

//* Local imports
import type { SampleRow } from "../../db/samples";

export type ChartsProps = {
  samples: SampleRow[];
};

export function Charts(props: ChartsProps) {
  const chartData = {
    labels: props.samples.map((sample) => sample.collected_at),
    power: {
      cpu_package_w: props.samples.map((sample) => sample.cpu_package_w),
      arc_card_w: props.samples.map((sample) => sample.arc_card_w),
      amd_igpu_w: props.samples.map((sample) => sample.amd_igpu_w),
    },
    temps: {
      ram0_temp_c: props.samples.map((sample) => sample.ram0_temp_c),
      ram1_temp_c: props.samples.map((sample) => sample.ram1_temp_c),
    },
  };

  return (
    <section class="charts" aria-label="Time series charts">
      <header class="section-header">
        <h2>Trends</h2>
        <p>Power and temperature over the selected window</p>
      </header>

      <div class="chart-block">
        <h3>Power (W)</h3>
        <canvas id="power-chart" aria-label="Power chart"></canvas>
      </div>

      <div class="chart-block">
        <h3>RAM temperature (°C)</h3>
        <canvas id="temp-chart" aria-label="Temperature chart"></canvas>
      </div>

      <script
        type="application/json"
        id="chart-data"
      >{JSON.stringify(chartData)}</script>
      <script src="/public/dashboard.js"></script>
    </section>
  );
}
