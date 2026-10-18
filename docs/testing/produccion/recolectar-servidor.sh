#!/usr/bin/env bash
# Recolecta del servidor de produccion (Lightsail) los datos de hardware, uso de recursos y logs del backend
# para el reporte de pruebas. Solo lee: no cambia nada y no imprime secretos (no toca el .env).
#
# En el servidor:
#   cd /opt/ecocampus && bash docs/testing/produccion/recolectar-servidor.sh > /tmp/servidor.txt
# y pega el contenido de /tmp/servidor.txt (o copialo a docs/testing/produccion/resultados/servidor.txt).
# Con DESDE se acota la ventana de logs (por defecto 24h): DESDE=2h bash ...
set -u
DESDE="${DESDE:-24h}"
# Si se ejecuta como archivo dentro del repo, entra a la raiz; si llega por tuberia ($0 = bash) se usa el directorio actual
# (o REPO=/ruta). El compose se lee de ahi.
if [ -n "${REPO:-}" ]; then cd "$REPO" || exit 1; elif [ -f "$0" ]; then cd "$(dirname "$0")/../../.." || exit 1; fi
[ -f docker-compose.yml ] || { echo "Ejecutalo desde la raiz del repo (donde esta docker-compose.yml) o define REPO=/opt/ecocampus" >&2; exit 1; }
PETICIONES="$(mktemp)"
trap 'rm -f "$PETICIONES"' EXIT

echo "## Fecha"
date -u +"%Y-%m-%d %H:%M:%S UTC"

echo
echo "## Sistema operativo"
. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME"
uname -r

echo
echo "## CPU"
nproc | sed 's/^/vCPU: /'
grep -m1 "model name" /proc/cpuinfo | sed 's/^model name[[:space:]]*:[[:space:]]*/Modelo: /'

echo
echo "## Memoria (MB)"
free -m
echo
echo "## Disco"
df -h / | tail -2

echo
echo "## Contenedores"
docker compose ps --format 'table {{.Name}}\t{{.Status}}\t{{.Image}}' 2>/dev/null

echo
echo "## Uso de recursos de los contenedores (instantaneo)"
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}' 2>/dev/null

echo
echo "## Versiones"
docker --version
docker compose version

echo
echo "## Carga del sistema"
uptime

echo
echo "## Backend: peticiones atendidas en los ultimos $DESDE (log del backend)"
# Cada linea del log: "<fecha> [INFO|WARN|ERROR] METODO /ruta ESTADO NNms". Se quitan los colores ANSI.
docker compose logs --since "$DESDE" --no-log-prefix backend 2>/dev/null \
  | sed 's/\x1b\[[0-9;]*m//g' \
  | awk '$3 ~ /^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)$/ && $6 ~ /ms$/ { ms = $6; sub(/ms$/, "", ms); print $3, $4, $5, ms }' \
  > "$PETICIONES"
echo "Peticiones registradas: $(wc -l < "$PETICIONES")"
echo
echo "metodo ruta | peticiones | 2xx/3xx | 4xx | 5xx | media ms | p50 | p95 | p99 | max"
# Ordenado por endpoint y tiempo: los percentiles salen por posicion, sin depender de gawk
sort -k1,1 -k2,2 -k4,4n "$PETICIONES" | awk '
  function cerrar(   i50, i95, i99) {
    if (n == 0) return
    i50 = int((n * 50 + 99) / 100); i95 = int((n * 95 + 99) / 100); i99 = int((n * 99 + 99) / 100)
    printf "%s | %d | %d | %d | %d | %.0f | %s | %s | %s | %s\n", clave, n, e2, e4, e5, suma / n, v[i50], v[i95], v[i99], v[n]
  }
  { k = $1 " " $2
    if (k != clave) { cerrar(); clave = k; n = 0; suma = 0; e2 = 0; e4 = 0; e5 = 0 }
    n++; v[n] = $4; suma += $4
    if ($3 >= 500) e5++; else if ($3 >= 400) e4++; else e2++ }
  END { cerrar() }'

echo
echo "## Backend: errores y advertencias distintos (ultimos $DESDE)"
docker compose logs --since "$DESDE" --no-log-prefix backend 2>/dev/null \
  | sed 's/\x1b\[[0-9;]*m//g' | grep -E "\[(WARN|ERROR)\]" | sed -E 's/^[0-9T:.Z-]+ //' | sed -E 's/[0-9a-f]{16}/<id>/g' \
  | sort | uniq -c | sort -rn | head -20

echo
echo "## Proxy (Caddy): lineas de log (ultimos $DESDE)"
docker compose logs --since "$DESDE" --no-log-prefix proxy 2>/dev/null | grep -c . | sed 's/^/Lineas de log: /'

echo
echo "## Reinicios de contenedores"
docker inspect -f '{{.Name}} reinicios={{.RestartCount}} inicio={{.State.StartedAt}}' $(docker compose ps -q) 2>/dev/null

echo
echo "## Base de datos (sin datos personales)"
docker compose exec -T db sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT COUNT(*) AS respuestas, MIN(creado_en) AS primera, MAX(creado_en) AS ultima FROM respuestas; SELECT metodo_acceso, COUNT(*) AS n FROM respuestas GROUP BY metodo_acceso; SELECT COUNT(*) AS sesiones_activas FROM sessions;"' 2>/dev/null
