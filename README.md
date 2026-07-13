# Thunder-Cat

Personal power-monitoring daemon for this machine (AMD Ryzen 9 9950X3D + Intel Arc B580 + AMD iGPU).

It runs in the background, samples sensors every 5 seconds, stores rows in SQLite (`bun:sqlite`), and exposes a small HTTP API for time-series queries / future charts.

## What it collects

| Domain | Source | Metric |
|--------|--------|--------|
| CPU package / core | RAPL (`/sys/class/powercap/intel-rapl:*`) | Watts (from energy delta) |
| Intel Arc B580 | hwmon `xe` | Watts (from energy delta) |
| AMD iGPU | hwmon `amdgpu` `power1_input` | Watts |
| RAM modules | hwmon `spd5118` | Temperature (°C) |

Coolers / motherboard power are out of scope for v1.

## Requirements

- [Bun](https://bun.sh)
- Linux with sysfs sensors (this host)
- RAPL energy files readable by the process user (see below)

## Setup

```bash
bun install
bun run start
```

Development (watch mode):

```bash
bun run dev
```

Default listen address: `http://127.0.0.1:3927`

Env overrides:

- `PORT` — HTTP port (default `3927`)
- `HOST` — bind host (default `127.0.0.1`)

SQLite file: `data/thunder-cat.sqlite` (created automatically, gitignored).

## RAPL permissions

Reading `/sys/class/powercap/intel-rapl:*/energy_uj` is often root-only. Without access, CPU watt columns stay `null`.

### Option A — udev rule (recommended)

Create `/etc/udev/rules.d/99-rapl-readable.rules`:

```
SUBSYSTEM=="powercap", KERNEL=="intel-rapl:*", RUN+="/bin/chmod -R a+r /sys/class/powercap/%k"
```

Then reload:

```bash
sudo udevadm control --reload
sudo udevadm trigger --subsystem-match=powercap
```

Verify:

```bash
cat /sys/class/powercap/intel-rapl:0/energy_uj
```

### Option B — one-shot chmod (until reboot)

```bash
sudo chmod -R a+r /sys/class/powercap/intel-rapl:0
```

## API

### `GET /health`

```json
{ "ok": true, "uptimeMs": 12345, "lastSampleAt": 1710000000000 }
```

### `GET /samples/latest`

```json
{ "sample": { "id": 1, "collected_at": 1710000000000, "cpu_package_w": 48.2, "...": "..." } }
```

### `GET /samples?from=&to=&limit=`

Query params (unix ms):

- `from` — start (default: `to - 1h`)
- `to` — end (default: now)
- `limit` — max rows (default `1000`, cap `10000`)

```bash
curl "http://127.0.0.1:3927/samples?from=0&to=9999999999999&limit=100"
```

## Tests

```bash
bun test
bun test src/utils/power.test.ts
```

## Scripts

| Script | Command |
|--------|---------|
| `dev` | `bun run --watch src/index.ts` |
| `start` | `bun run src/index.ts` |
| `test` | `bun test` |
