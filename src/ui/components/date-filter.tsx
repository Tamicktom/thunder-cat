//* Libraries imports
import { Html } from "@elysia/html";

export type DateFilterProps = {
  fromMs: number;
  toMs: number;
};

function toDatetimeLocalValue(ms: number): string {
  const date = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function presetHref(hours: number): string {
  const to = Date.now();
  const from = to - hours * 60 * 60 * 1000;
  return `/?from=${from}&to=${to}`;
}

export function DateFilter(props: DateFilterProps) {
  return (
    <section class="filters" aria-label="Date range filters">
      <div class="presets">
        <a class="preset" href={presetHref(1)} id="preset-1h">
          1h
        </a>
        <a class="preset" href={presetHref(6)} id="preset-6h">
          6h
        </a>
        <a class="preset" href={presetHref(24)} id="preset-24h">
          24h
        </a>
        <a class="preset" href={presetHref(168)} id="preset-7d">
          7d
        </a>
      </div>

      <form class="filter-form" method="get" action="/">
        <label class="field" for="from">
          <span>From</span>
          <input
            id="from"
            name="from"
            type="datetime-local"
            value={toDatetimeLocalValue(props.fromMs)}
            required
          />
        </label>
        <label class="field" for="to">
          <span>To</span>
          <input
            id="to"
            name="to"
            type="datetime-local"
            value={toDatetimeLocalValue(props.toMs)}
            required
          />
        </label>
        <button id="filter-apply" type="submit">
          Apply
        </button>
      </form>
    </section>
  );
}
