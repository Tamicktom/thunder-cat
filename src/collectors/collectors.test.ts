//* Libraries imports
import { afterEach, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

//* Local imports
import { ArcGpuCollector } from "./arc-gpu";
import { AmdIgpuCollector } from "./amd-igpu";
import { RamTempCollector } from "./ram-temp";
import { RaplCollector } from "./rapl";

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

describe("RaplCollector", () => {
  it("returns null on first tick and watts after a second energy reading", () => {
    const root = createTempRoot("thunder-cat-rapl");
    const packagePath = join(root, "intel-rapl:0");
    const corePath = join(root, "intel-rapl:0:0");
    mkdirSync(packagePath);
    mkdirSync(corePath);
    writeFileSync(join(packagePath, "name"), "package-0\n");
    writeFileSync(join(corePath, "name"), "core\n");
    writeFileSync(join(packagePath, "energy_uj"), "1000000\n");
    writeFileSync(join(corePath, "energy_uj"), "500000\n");

    const collector = new RaplCollector(root);
    const first = collector.collect(0);
    expect(first.packageWatts).toBeNull();
    expect(first.coreWatts).toBeNull();

    writeFileSync(join(packagePath, "energy_uj"), "6000000\n");
    writeFileSync(join(corePath, "energy_uj"), "2500000\n");
    const second = collector.collect(1000);

    expect(second.packageWatts).toBe(5);
    expect(second.coreWatts).toBe(2);
  });
});

describe("ArcGpuCollector", () => {
  it("computes card and package watts from energy counters", () => {
    const root = createTempRoot("thunder-cat-arc");
    const hwmon = join(root, "hwmon0");
    mkdirSync(hwmon);
    writeFileSync(join(hwmon, "name"), "xe\n");
    writeFileSync(join(hwmon, "energy1_input"), "1000000\n");
    writeFileSync(join(hwmon, "energy2_input"), "2000000\n");

    const collector = new ArcGpuCollector(root);
    expect(collector.collect(0).cardWatts).toBeNull();

    writeFileSync(join(hwmon, "energy1_input"), "11000000\n");
    writeFileSync(join(hwmon, "energy2_input"), "7000000\n");
    const reading = collector.collect(1000);

    expect(reading.cardWatts).toBe(10);
    expect(reading.pkgWatts).toBe(5);
  });
});

describe("AmdIgpuCollector", () => {
  it("reads instantaneous power in watts", () => {
    const root = createTempRoot("thunder-cat-amd");
    const hwmon = join(root, "hwmon0");
    mkdirSync(hwmon);
    writeFileSync(join(hwmon, "name"), "amdgpu\n");
    writeFileSync(join(hwmon, "power1_input"), "11000000\n");

    const collector = new AmdIgpuCollector(root);
    expect(collector.collect().watts).toBe(11);
  });
});

describe("RamTempCollector", () => {
  it("reads temperatures from spd5118 modules", () => {
    const root = createTempRoot("thunder-cat-ram");
    const hwmon0 = join(root, "hwmon0");
    const hwmon1 = join(root, "hwmon1");
    mkdirSync(hwmon0);
    mkdirSync(hwmon1);
    writeFileSync(join(hwmon0, "name"), "spd5118\n");
    writeFileSync(join(hwmon1, "name"), "spd5118\n");
    writeFileSync(join(hwmon0, "temp1_input"), "37000\n");
    writeFileSync(join(hwmon1, "temp1_input"), "38000\n");

    const collector = new RamTempCollector(root);
    const reading = collector.collect();

    expect(reading.ram0TempC).toBe(37);
    expect(reading.ram1TempC).toBe(38);
  });
});
