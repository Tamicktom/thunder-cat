#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SERVICE_NAME="thunder-cat"
SERVICE_TEMPLATE="${SCRIPT_DIR}/thunder-cat.service"
SERVICE_DEST="${HOME}/.config/systemd/user/${SERVICE_NAME}.service"
UDEV_RULE_SRC="${SCRIPT_DIR}/99-rapl-readable.rules"
UDEV_RULE_DEST="/etc/udev/rules.d/99-rapl-readable.rules"
BINARY_PATH="${REPO_ROOT}/dist/thunder-cat"
RAPL_ENERGY="/sys/class/powercap/intel-rapl:0/energy_uj"

usage() {
  cat <<EOF
Usage: $(basename "$0") [command]

Commands:
  (default)   Install deps, compile binary, install RAPL udev rule,
              install systemd user service, enable linger, and start.
  --restart   Rebuild binary and restart the service.
  --status    Show service status and RAPL readability.
  --uninstall Stop/disable service; remove unit and RAPL udev rule.
  -h, --help  Show this help.
EOF
}

require_bun() {
  if ! command -v bun >/dev/null 2>&1; then
    echo "error: bun is not installed or not on PATH" >&2
    exit 1
  fi
}

require_sudo() {
  if ! command -v sudo >/dev/null 2>&1; then
    echo "error: sudo is required for RAPL udev setup" >&2
    exit 1
  fi
  sudo -v
}

install_deps() {
  echo "==> Installing dependencies"
  (cd "${REPO_ROOT}" && bun install)
}

build_binary() {
  echo "==> Compiling binary to ${BINARY_PATH}"
  mkdir -p "${REPO_ROOT}/dist"
  (cd "${REPO_ROOT}" && bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun-linux-x64 \
    --outfile dist/thunder-cat \
    src/index.ts)
  chmod +x "${BINARY_PATH}"
}

install_rapl_udev() {
  echo "==> Installing RAPL udev rule (requires sudo)"
  require_sudo
  sudo install -m 644 "${UDEV_RULE_SRC}" "${UDEV_RULE_DEST}"
  sudo udevadm control --reload
  sudo udevadm trigger --subsystem-match=powercap

  if [[ -r "${RAPL_ENERGY}" ]]; then
    echo "    RAPL readable: ${RAPL_ENERGY}"
  else
    echo "warning: ${RAPL_ENERGY} is still not readable; reboot may be required" >&2
  fi
}

install_service() {
  echo "==> Installing systemd user service"
  mkdir -p "$(dirname "${SERVICE_DEST}")"
  sed "s|__REPO_ROOT__|${REPO_ROOT}|g" "${SERVICE_TEMPLATE}" >"${SERVICE_DEST}"
  systemctl --user daemon-reload
}

enable_linger() {
  echo "==> Enabling linger for ${USER} (start at boot without login)"
  if loginctl show-user "${USER}" 2>/dev/null | grep -q "Linger=yes"; then
    echo "    Linger already enabled"
    return
  fi

  if loginctl enable-linger "${USER}" 2>/dev/null; then
    echo "    Linger enabled"
  else
    require_sudo
    sudo loginctl enable-linger "${USER}"
    echo "    Linger enabled (via sudo)"
  fi
}

start_service() {
  echo "==> Enabling and starting ${SERVICE_NAME}"
  systemctl --user enable --now "${SERVICE_NAME}.service"
  systemctl --user --no-pager --full status "${SERVICE_NAME}.service" || true
}

cmd_install() {
  require_bun
  install_deps
  build_binary
  install_rapl_udev
  install_service
  enable_linger
  start_service
  echo
  echo "Thunder-Cat is installed and running."
  echo "Dashboard: http://127.0.0.1:3927/"
  echo "Status:    $(basename "$0") --status"
}

cmd_restart() {
  require_bun
  build_binary
  systemctl --user restart "${SERVICE_NAME}.service"
  systemctl --user --no-pager --full status "${SERVICE_NAME}.service" || true
}

cmd_status() {
  systemctl --user --no-pager --full status "${SERVICE_NAME}.service" || true
  echo
  if [[ -r "${RAPL_ENERGY}" ]]; then
    echo "RAPL: readable (${RAPL_ENERGY})"
  elif [[ -e "${RAPL_ENERGY}" ]]; then
    echo "RAPL: present but not readable (${RAPL_ENERGY})"
  else
    echo "RAPL: ${RAPL_ENERGY} not found"
  fi
}

cmd_uninstall() {
  echo "==> Stopping and disabling ${SERVICE_NAME}"
  systemctl --user disable --now "${SERVICE_NAME}.service" 2>/dev/null || true

  if [[ -f "${SERVICE_DEST}" ]]; then
    rm -f "${SERVICE_DEST}"
    systemctl --user daemon-reload
    echo "    Removed ${SERVICE_DEST}"
  fi

  if [[ -f "${UDEV_RULE_DEST}" ]]; then
    echo "==> Removing RAPL udev rule (requires sudo)"
    require_sudo
    sudo rm -f "${UDEV_RULE_DEST}"
    sudo udevadm control --reload
    echo "    Removed ${UDEV_RULE_DEST}"
  fi

  echo "Uninstall complete (binary and data left in place)."
}

case "${1:-}" in
  "" )
    cmd_install
    ;;
  --restart )
    cmd_restart
    ;;
  --status )
    cmd_status
    ;;
  --uninstall )
    cmd_uninstall
    ;;
  -h|--help )
    usage
    ;;
  * )
    echo "error: unknown command: $1" >&2
    usage >&2
    exit 1
    ;;
esac
