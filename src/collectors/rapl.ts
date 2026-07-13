//* Libraries imports
import { join } from "node:path";

//* Local imports
import type { EnergySnapshot } from "./types";
import { powerFromEnergyDelta } from "../utils/power";
import { readSysfsNumber, readSysfsText } from "../utils/sysfs";

const MICROJOULES_TO_JOULES = 1 / 1_000_000;
const DEFAULT_POWERCAP_ROOT = "/sys/class/powercap";

export type RaplReading = {
  packageWatts: number | null;
  coreWatts: number | null;
};

type RaplZone = {
  path: string;
  name: string;
};

export class RaplCollector {
  private packageSnapshot: EnergySnapshot | null = null;
  private coreSnapshot: EnergySnapshot | null = null;
  private powercapRoot: string;

  constructor(powercapRoot: string = DEFAULT_POWERCAP_ROOT) {
    this.powercapRoot = powercapRoot;
  }

  collect(nowMs: number = Date.now()): RaplReading {
    const zones = this.discoverZones();
    const packageZone = zones.find((zone) => zone.name === "package-0");
    const coreZone = zones.find((zone) => zone.name === "core");

    const packageWatts = packageZone
      ? this.readZoneWatts(packageZone, "package", nowMs)
      : null;
    const coreWatts = coreZone
      ? this.readZoneWatts(coreZone, "core", nowMs)
      : null;

    return {
      packageWatts,
      coreWatts,
    };
  }

  private discoverZones(): RaplZone[] {
    const zones: RaplZone[] = [];
    const roots = ["intel-rapl:0", "intel-rapl:0:0"];

    for (const root of roots) {
      const path = join(this.powercapRoot, root);
      const name = readSysfsText(join(path, "name"));
      if (name === null) {
        continue;
      }
      zones.push({ path, name });
    }

    return zones;
  }

  private readZoneWatts(
    zone: RaplZone,
    kind: "package" | "core",
    nowMs: number,
  ): number | null {
    const energy = readSysfsNumber(join(zone.path, "energy_uj"));
    if (energy === null) {
      return null;
    }

    const previous =
      kind === "package" ? this.packageSnapshot : this.coreSnapshot;
    const result = powerFromEnergyDelta(
      previous,
      energy,
      nowMs,
      MICROJOULES_TO_JOULES,
    );

    if (kind === "package") {
      this.packageSnapshot = result.snapshot;
    } else {
      this.coreSnapshot = result.snapshot;
    }

    return result.watts;
  }
}
