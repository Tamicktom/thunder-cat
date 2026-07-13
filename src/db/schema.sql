CREATE TABLE IF NOT EXISTS samples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collected_at INTEGER NOT NULL,
  cpu_package_w REAL,
  cpu_core_w REAL,
  arc_card_w REAL,
  arc_pkg_w REAL,
  amd_igpu_w REAL,
  ram0_temp_c REAL,
  ram1_temp_c REAL
);

CREATE INDEX IF NOT EXISTS idx_samples_collected_at ON samples(collected_at);
