//* Libraries imports
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function readSysfsText(path: string): string | null {
  try {
    return readFileSync(path, "utf8").trim();
  } catch {
    return null;
  }
}

export function readSysfsNumber(path: string): number | null {
  const text = readSysfsText(path);
  if (text === null) {
    return null;
  }

  const value = Number(text);
  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
}

export function listHwmonDevices(hwmonRoot: string = "/sys/class/hwmon"): string[] {
  try {
    return readdirSync(hwmonRoot)
      .filter((entry) => entry.startsWith("hwmon"))
      .map((entry) => join(hwmonRoot, entry));
  } catch {
    return [];
  }
}

export function findHwmonByName(
  name: string,
  hwmonRoot: string = "/sys/class/hwmon",
): string | null {
  const devices = listHwmonDevices(hwmonRoot);

  for (const devicePath of devices) {
    const deviceName = readSysfsText(join(devicePath, "name"));
    if (deviceName === name) {
      return devicePath;
    }
  }

  return null;
}

export function findAllHwmonByName(
  name: string,
  hwmonRoot: string = "/sys/class/hwmon",
): string[] {
  const devices = listHwmonDevices(hwmonRoot);
  const matches: string[] = [];

  for (const devicePath of devices) {
    const deviceName = readSysfsText(join(devicePath, "name"));
    if (deviceName === name) {
      matches.push(devicePath);
    }
  }

  return matches;
}
