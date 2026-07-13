//* Libraries imports
import { join } from "node:path";

//* Local imports
import { microWattsToWatts } from "../utils/power";
import { findHwmonByName, readSysfsNumber } from "../utils/sysfs";

export type AmdIgpuReading = {
  watts: number | null;
};

export class AmdIgpuCollector {
  private hwmonRoot: string;

  constructor(hwmonRoot: string = "/sys/class/hwmon") {
    this.hwmonRoot = hwmonRoot;
  }

  collect(): AmdIgpuReading {
    const devicePath = findHwmonByName("amdgpu", this.hwmonRoot);
    if (devicePath === null) {
      return { watts: null };
    }

    const microWatts = readSysfsNumber(join(devicePath, "power1_input"));
    if (microWatts === null) {
      return { watts: null };
    }

    return { watts: microWattsToWatts(microWatts) };
  }
}
