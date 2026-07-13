//* Libraries imports
import { join } from "node:path";

//* Local imports
import { milliCelsiusToCelsius } from "../utils/power";
import { findAllHwmonByName, readSysfsNumber } from "../utils/sysfs";

export type RamTempReading = {
  ram0TempC: number | null;
  ram1TempC: number | null;
};

export class RamTempCollector {
  private hwmonRoot: string;

  constructor(hwmonRoot: string = "/sys/class/hwmon") {
    this.hwmonRoot = hwmonRoot;
  }

  collect(): RamTempReading {
    const devices = findAllHwmonByName("spd5118", this.hwmonRoot).sort();
    const temps = devices.map((devicePath) => {
      const milliCelsius = readSysfsNumber(join(devicePath, "temp1_input"));
      if (milliCelsius === null) {
        return null;
      }
      return milliCelsiusToCelsius(milliCelsius);
    });

    return {
      ram0TempC: temps[0] ?? null,
      ram1TempC: temps[1] ?? null,
    };
  }
}
