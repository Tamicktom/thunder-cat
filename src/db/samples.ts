//* Libraries imports
import type { Database } from "bun:sqlite";

//* Local imports
import type { Sample } from "../collectors/types";

export type SampleRow = Sample & {
  id: number;
};

export type SampleQueryOptions = {
  from: number;
  to: number;
  limit: number;
};

const INSERT_SQL = `
  INSERT INTO samples (
    collected_at,
    cpu_package_w,
    cpu_core_w,
    arc_card_w,
    arc_pkg_w,
    amd_igpu_w,
    ram0_temp_c,
    ram1_temp_c
  ) VALUES (
    $collected_at,
    $cpu_package_w,
    $cpu_core_w,
    $arc_card_w,
    $arc_pkg_w,
    $amd_igpu_w,
    $ram0_temp_c,
    $ram1_temp_c
  )
`;

export function insertSample(db: Database, sample: Sample): void {
  db.query(INSERT_SQL).run({
    collected_at: sample.collected_at,
    cpu_package_w: sample.cpu_package_w,
    cpu_core_w: sample.cpu_core_w,
    arc_card_w: sample.arc_card_w,
    arc_pkg_w: sample.arc_pkg_w,
    amd_igpu_w: sample.amd_igpu_w,
    ram0_temp_c: sample.ram0_temp_c,
    ram1_temp_c: sample.ram1_temp_c,
  });
}

export function getLatestSample(db: Database): SampleRow | null {
  const row = db
    .query("SELECT * FROM samples ORDER BY collected_at DESC, id DESC LIMIT 1")
    .get() as SampleRow | null;

  return row ?? null;
}

export function getSamplesInRange(
  db: Database,
  options: SampleQueryOptions,
): SampleRow[] {
  return db
    .query(
      `
      SELECT * FROM samples
      WHERE collected_at >= $from AND collected_at <= $to
      ORDER BY collected_at ASC, id ASC
      LIMIT $limit
    `,
    )
    .all({
      from: options.from,
      to: options.to,
      limit: options.limit,
    }) as SampleRow[];
}

export function getLastSampleAt(db: Database): number | null {
  const row = db
    .query("SELECT collected_at FROM samples ORDER BY collected_at DESC LIMIT 1")
    .get() as { collected_at: number } | null;

  return row?.collected_at ?? null;
}
