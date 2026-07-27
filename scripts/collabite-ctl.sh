#!/usr/bin/env bash
# =============================================================================
# collabite-ctl — CLI ringan untuk systemctl di server 1Panel Collabite
# =============================================================================
# Default app root:
#   /opt/1panel/www/sites/collabite.rizqis.com/index
# =============================================================================

set -euo pipefail

APP_ROOT="${COLLABITE_APP_ROOT:-/opt/1panel/www/sites/collabite.rizqis.com/index}"
QUEUE_UNIT="${COLLABITE_QUEUE_UNIT:-collabite-queue.service}"
PHP_UNIT="${COLLABITE_PHP_UNIT:-php8.4-fpm.service}"
NGINX_UNIT="${COLLABITE_NGINX_UNIT:-nginx.service}"

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

is_service() {
  case "$1" in
    queue|worker|php|fpm|php-fpm|nginx|web|http) return 0 ;;
    *) return 1 ;;
  esac
}

is_action() {
  case "$1" in
    start|stop|restart|reload|enable|disable) return 0 ;;
    *) return 1 ;;
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
collabite-ctl — wrapper systemctl Collabite (1Panel)

Usage (dua gaya OK):
  sudo collabite-ctl <command> <service>
  sudo collabite-ctl <service> <command>

Contoh yang benar:
  sudo collabite-ctl enable queue
  sudo collabite-ctl queue enable
  sudo collabite-ctl start queue
  sudo collabite-ctl queue start
  sudo collabite-ctl status
  sudo collabite-ctl doctor
  sudo collabite-ctl logs queue
  sudo collabite-ctl all restart

Services: queue | php | nginx
App root: ${APP_ROOT}
EOF
}

cmd_doctor() {
  echo "== Collabite doctor =="
  echo "APP_ROOT: $APP_ROOT"
  if [[ -f "$APP_ROOT/artisan" ]]; then echo "artisan: OK"; else echo "artisan: MISSING"; fi
  if [[ -f "$APP_ROOT/.env" ]]; then echo ".env: OK"; else echo ".env: MISSING"; fi
  echo
  for label in queue php nginx; do
    u="$(resolve_unit "$label")"
    if unit_exists "$u"; then
      echo "$label ($u): active=$(systemctl is-active "$u" 2>/dev/null || true) enabled=$(systemctl is-enabled "$u" 2>/dev/null || true)"
    else
      echo "$label ($u): UNIT NOT INSTALLED"
    fi
  done
  echo
  echo "PHP binary hint: which php ; php -v"
  echo "User hint:      id www-data ; ls -ld $APP_ROOT"
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

run_action() {
  local action="$1"
  local service="$2"
  local u
  u="$(resolve_unit "$service")"
  sys "$action" "$u"
  systemctl --no-pager --full status "$u" || true
}

main() {
  local a="${1:-help}"
  local b="${2:-}"

  case "$a" in
    help|-h|--help) cmd_help; return ;;
    doctor) cmd_doctor; return ;;
    status) shift || true; cmd_status "$@"; return ;;
    logs) shift || true; cmd_logs "$@"; return ;;
    all)
      [[ "${b:-}" == "restart" ]] || die "usage: collabite-ctl all restart"
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
      return
      ;;
  esac

  # enable queue  /  start queue
  if is_action "$a" && [[ -n "$b" ]] && is_service "$b"; then
    run_action "$a" "$b"
    return
  fi

  # queue enable  /  queue start
  if is_service "$a" && [[ -n "$b" ]] && is_action "$b"; then
    run_action "$b" "$a"
    return
  fi

  # queue  → status
  if is_service "$a" && [[ -z "$b" ]]; then
    cmd_status "$a"
    return
  fi

  die "perintah tidak dikenal. Coba: sudo collabite-ctl help"
}

main "$@"
