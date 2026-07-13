//* Libraries imports
import { join } from "node:path";

//* Local imports
import type { EnergySnapshot } from "./types";
import { powerFromEnergyDelta } from "../utils/power";
import { findHwmonByName, readSysfsNumber } from "../utils/sysfs";

/** Intel Arc (xe) energy counters are in microjoules. */
const MICROJOULES_TO_JOULES = 1 / 1_000_000;

export type ArcGpuReading = {
  cardWatts: number | null;
  pkgWatts: number | null;
};

export class ArcGpuCollector {
  private cardSnapshot: EnergySnapshot | null = null;
  private pkgSnapshot: EnergySnapshot | null = null;
  private hwmonRoot: string;

  constructor(hwmonRoot: string = "/sys/class/hwmon") {
    this.hwmonRoot = hwmonRoot;
  }

  collect(nowMs: number = Date.now()): ArcGpuReading {
    const devicePath = findHwmonByName("xe", this.hwmonRoot);
    if (devicePath === null) {
      return { cardWatts: null, pkgWatts: null };
    }

    return {
      cardWatts: this.readEnergyWatts(
        join(devicePath, "energy1_input"),
        "card",
        nowMs,
      ),
      pkgWatts: this.readEnergyWatts(
        join(devicePath, "energy2_input"),
        "pkg",
        nowMs,
      ),
    };
  }

  private readEnergyWatts(
    path: string,
    kind: "card" | "pkg",
    nowMs: number,
  ): number | null {
    const energy = readSysfsNumber(path);
    if (energy === null) {
      return null;
    }

    const previous = kind === "card" ? this.cardSnapshot : this.pkgSnapshot;
    const result = powerFromEnergyDelta(
      previous,
      energy,
      nowMs,
      MICROJOULES_TO_JOULES,
    );

    if (kind === "card") {
      this.cardSnapshot = result.snapshot;
    } else {
      this.pkgSnapshot = result.snapshot;
    }

    return result.watts;
  }
}
