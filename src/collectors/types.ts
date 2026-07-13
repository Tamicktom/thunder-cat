export type Sample = {
  collected_at: number;
  cpu_package_w: number | null;
  cpu_core_w: number | null;
  arc_card_w: number | null;
  arc_pkg_w: number | null;
  amd_igpu_w: number | null;
  ram0_temp_c: number | null;
  ram1_temp_c: number | null;
};

export type EnergySnapshot = {
  energy: number;
  timestampMs: number;
};

export type PowerFromEnergyResult = {
  watts: number | null;
  snapshot: EnergySnapshot;
};
