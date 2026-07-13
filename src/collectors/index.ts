//* Local imports
import { AmdIgpuCollector } from "./amd-igpu";
import { ArcGpuCollector } from "./arc-gpu";
import { RamTempCollector } from "./ram-temp";
import { RaplCollector } from "./rapl";
import type { Sample } from "./types";

export type Collectors = {
  rapl: RaplCollector;
  arcGpu: ArcGpuCollector;
  amdIgpu: AmdIgpuCollector;
  ramTemp: RamTempCollector;
};

export function createCollectors(): Collectors {
  return {
    rapl: new RaplCollector(),
    arcGpu: new ArcGpuCollector(),
    amdIgpu: new AmdIgpuCollector(),
    ramTemp: new RamTempCollector(),
  };
}

export function collectSample(
  collectors: Collectors,
  nowMs: number = Date.now(),
): Sample {
  const rapl = collectors.rapl.collect(nowMs);
  const arc = collectors.arcGpu.collect(nowMs);
  const amd = collectors.amdIgpu.collect();
  const ram = collectors.ramTemp.collect();

  return {
    collected_at: nowMs,
    cpu_package_w: rapl.packageWatts,
    cpu_core_w: rapl.coreWatts,
    arc_card_w: arc.cardWatts,
    arc_pkg_w: arc.pkgWatts,
    amd_igpu_w: amd.watts,
    ram0_temp_c: ram.ram0TempC,
    ram1_temp_c: ram.ram1TempC,
  };
}
