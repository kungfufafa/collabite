#!/usr/bin/env bash
# =============================================================================
# collabite-ctl — CLI ringan untuk systemctl di server 1Panel Collabite
# =============================================================================
# Default app root (document root Laravel):
#   /opt/1panel/www/sites/collabite.rizqis.com/index
#
# Install cepat di VPS:
#   sudo cp scripts/collabite-ctl.sh /usr/local/bin/collabite-ctl
#   sudo chmod +x /usr/local/bin/collabite-ctl
#   sudo cp scripts/systemd/collabite-queue.service /etc/systemd/system/
#   # sesuaikan User= / php path di unit bila perlu
#   sudo systemctl daemon-reload
#   sudo collabite-ctl queue enable
#   sudo collabite-ctl queue start
#
# Contoh:
#   sudo collabite-ctl status
#   sudo collabite-ctl queue restart
#   sudo collabite-ctl php restart
#   sudo collabite-ctl nginx reload
#   sudo collabite-ctl all restart
# =============================================================================

set -euo pipefail

APP_ROOT="${COLLABITE_APP_ROOT:-/opt/1panel/www/sites/collabite.rizqis.com/index}"

# Nama unit — override lewat env kalau beda di 1Panel kamu
QUEUE_UNIT="${COLLABITE_QUEUE_UNIT:-collabite-queue.service}"
PHP_UNIT="${COLLABITE_PHP_UNIT:-php8.4-fpm.service}"
NGINX_UNIT="${COLLABITE_NGINX_UNIT:-nginx.service}"
# Beberapa instalasi 1Panel memakai openresty:
#   COLLABITE_NGINX_UNIT=openresty.service

die() { echo "error: $*" >&2; exit 1; }
need_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    die "jalankan dengan sudo (butuh systemctl)"
  fi
}

resolve_unit() {
  case "$1" in
    queue|worker) echo "$QUEUE_UNIT" ;;
    php|fpm|php-fpm) echo "$PHP_UNIT" ;;
    nginx|web|http) echo "$NGINX_UNIT" ;;
    *) die "service tidak dikenal: $1 (pakai: queue|php|nginx)" ;;
  esac
}

unit_exists() {
  systemctl cat "$1" &>/dev/null
}

sys() {
  need_root
  systemctl "$@"
}

cmd_help() {
  cat <<EOF
collabite-ctl — wrapper systemctl untuk Collabite (1Panel)

Usage:
  sudo collabite-ctl <command> [service]

Commands:
  status [service]     Status (default: semua: queue, php, nginx)
  start <service>      Start unit
  stop <service>       Stop unit
  restart <service>    Restart unit
  reload <service>     Reload unit (nginx/php)
  enable <service>     Enable on boot
  disable <service>    Disable on boot
  logs <service>       journalctl -u -f (Ctrl+C keluar)
  all restart          Restart queue + php + nginx
  doctor               Cek path app + unit terpasang
  help                 Tampilkan bantuan

Services:
  queue | worker       ${QUEUE_UNIT}
  php   | fpm          ${PHP_UNIT}
  nginx | web          ${NGINX_UNIT}

Env override:
  COLLABITE_APP_ROOT=/path/to/laravel
  COLLABITE_QUEUE_UNIT=collabite-queue.service
  COLLABITE_PHP_UNIT=php8.4-fpm.service
  COLLABITE_NGINX_UNIT=nginx.service   # atau openresty.service

App root saat ini: ${APP_ROOT}
EOF
}

cmd_doctor() {
  echo "== Collabite doctor =="
  echo "APP_ROOT: $APP_ROOT"
  if [[ -f "$APP_ROOT/artisan" ]]; then
    echo "artisan: OK"
  else
    echo "artisan: MISSING (cek COLLABITE_APP_ROOT)"
  fi
  if [[ -f "$APP_ROOT/.env" ]]; then
    echo ".env: OK"
  else
    echo ".env: MISSING"
  fi
  echo
  for label in queue php nginx; do
    u="$(resolve_unit "$label")"
    if unit_exists "$u"; then
      state="$(systemctl is-active "$u" 2>/dev/null || true)"
      enabled="$(systemctl is-enabled "$u" 2>/dev/null || true)"
      echo "$label ($u): active=${state} enabled=${enabled}"
    else
      echo "$label ($u): UNIT NOT INSTALLED"
    fi
  done
  echo
  echo "Hint install queue unit:"
  echo "  sudo cp scripts/systemd/collabite-queue.service /etc/systemd/system/"
  echo "  sudo systemctl daemon-reload && sudo collabite-ctl queue enable && sudo collabite-ctl queue start"
}

cmd_status() {
  need_root
  if [[ $# -eq 0 ]]; then
    for label in queue php nginx; do
      u="$(resolve_unit "$label")"
      echo "---- $label ($u) ----"
      if unit_exists "$u"; then
        systemctl --no-pager --full status "$u" || true
      else
        echo "(unit belum terpasang)"
      fi
      echo
    done
    return
  fi
  u="$(resolve_unit "$1")"
  systemctl --no-pager --full status "$u"
}

cmd_logs() {
  need_root
  [[ $# -ge 1 ]] || die "usage: collabite-ctl logs <queue|php|nginx>"
  u="$(resolve_unit "$1")"
  journalctl -u "$u" -f -n 100
}

main() {
  local cmd="${1:-help}"
  shift || true

  case "$cmd" in
    help|-h|--help) cmd_help ;;
    doctor) cmd_doctor ;;
    status) cmd_status "$@" ;;
    logs) cmd_logs "$@" ;;
    start|stop|restart|reload|enable|disable)
      [[ $# -ge 1 ]] || die "usage: collabite-ctl $cmd <queue|php|nginx>"
      u="$(resolve_unit "$1")"
      sys "$cmd" "$u"
      systemctl --no-pager --full status "$u" || true
      ;;
    all)
      sub="${1:-}"
      [[ "$sub" == "restart" ]] || die "usage: collabite-ctl all restart"
      need_root
      for label in queue php nginx; do
        u="$(resolve_unit "$label")"
        if unit_exists "$u"; then
          echo ">> restart $u"
          systemctl restart "$u"
        else
          echo ">> skip $u (tidak terpasang)"
        fi
      done
      cmd_status
      ;;
    *)
      die "perintah tidak dikenal: $cmd (lihat: collabite-ctl help)"
      ;;
  esac
}

main "$@"
