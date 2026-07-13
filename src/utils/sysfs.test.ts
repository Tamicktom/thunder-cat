//* Libraries imports
import { afterEach, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

//* Local imports
import {
  findAllHwmonByName,
  findHwmonByName,
  readSysfsNumber,
  readSysfsText,
} from "./sysfs";

const tempRoots: string[] = [];

function createTempRoot(prefix: string): string {
  const root = join(tmpdir(), `${prefix}-${Date.now()}-${Math.random()}`);
  mkdirSync(root, { recursive: true });
  tempRoots.push(root);
  return root;
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("sysfs helpers", () => {
  it("reads trimmed text from a sysfs-like file", () => {
    const root = createTempRoot("thunder-cat-sysfs");
    const filePath = join(root, "name");
    writeFileSync(filePath, "amdgpu\n");

    expect(readSysfsText(filePath)).toBe("amdgpu");
  });

  it("returns null when the file cannot be read", () => {
    expect(readSysfsText("/tmp/thunder-cat-missing-file")).toBeNull();
  });

  it("parses numeric sysfs values", () => {
    const root = createTempRoot("thunder-cat-sysfs-num");
    const filePath = join(root, "power1_input");
    writeFileSync(filePath, "11000000\n");

    expect(readSysfsNumber(filePath)).toBe(11_000_000);
  });

  it("finds hwmon devices by name", () => {
    const root = createTempRoot("thunder-cat-hwmon");
    const hwmon0 = join(root, "hwmon0");
    const hwmon1 = join(root, "hwmon1");
    mkdirSync(hwmon0);
    mkdirSync(hwmon1);
    writeFileSync(join(hwmon0, "name"), "k10temp\n");
    writeFileSync(join(hwmon1, "name"), "xe\n");

    expect(findHwmonByName("xe", root)).toBe(hwmon1);
    expect(findHwmonByName("missing", root)).toBeNull();
  });

  it("finds all hwmon devices matching a name", () => {
    const root = createTempRoot("thunder-cat-hwmon-all");
    const hwmon0 = join(root, "hwmon0");
    const hwmon1 = join(root, "hwmon1");
    mkdirSync(hwmon0);
    mkdirSync(hwmon1);
    writeFileSync(join(hwmon0, "name"), "spd5118\n");
    writeFileSync(join(hwmon1, "name"), "spd5118\n");

    expect(findAllHwmonByName("spd5118", root).sort()).toEqual(
      [hwmon0, hwmon1].sort(),
    );
  });
});
