#!/usr/bin/env bash
# Registra CPU y memoria del servidor (y de cada contenedor) cada ~3 s en un CSV, para correrlo mientras se aplica carga.
# Solo lee: no cambia nada. Se detiene con Ctrl+C (o con DURACION=segundos).
#
# En el servidor, antes de lanzar la carga desde otra maquina:
#   cd /opt/ecocampus && git fetch origin docs/pruebas-produccion \
#     && git show origin/docs/pruebas-produccion:docs/testing/produccion/muestrear-recursos.sh > /tmp/muestrear.sh \
#     && DURACION=400 bash /tmp/muestrear.sh
# El CSV queda en /tmp/recursos.csv (cambia la ruta con SALIDA=...).
#
# Columnas: tiempo_s (desde el inicio), cpu_host_pct (todos los vCPU, 0-100), robo_pct (CPU quitada por el hipervisor:
# sube cuando se agota la capacidad de rafaga de Lightsail), mem_usada_mb, mem_disp_mb, carga1, y por contenedor
# (db, backend, proxy, frontend): cpu_pct (100 = un vCPU completo) y mem_mb.
set -u
SALIDA="${SALIDA:-/tmp/recursos.csv}"
DURACION="${DURACION:-0}"
CONTENEDORES="db backend proxy frontend"
[ -f docker-compose.yml ] || cd /opt/ecocampus 2>/dev/null || { echo "Ejecutalo desde la raiz del repo (docker-compose.yml)" >&2; exit 1; }

# Lee las cuatro primeras cifras de /proc/stat: total, idle y steal
leer_cpu() { awk '/^cpu /{ t=0; for (i=2;i<=NF;i++) t+=$i; print t, $5+$6, $9 }' /proc/stat; }

{
  printf "tiempo_s,cpu_host_pct,robo_pct,mem_usada_mb,mem_disp_mb,carga1"
  for c in $CONTENEDORES; do printf ",%s_cpu_pct,%s_mem_mb" "$c" "$c"; done
  echo
} > "$SALIDA"

inicio=$(date +%s)
read -r t0 i0 s0 < <(leer_cpu)
trap 'echo "Muestreo terminado: $SALIDA ($(($(wc -l < "$SALIDA") - 1)) muestras)" >&2; exit 0' INT TERM
echo "Muestreando en $SALIDA (Ctrl+C para terminar)..." >&2

while :; do
  ahora=$(date +%s); transcurrido=$((ahora - inicio))
  [ "$DURACION" -gt 0 ] && [ "$transcurrido" -ge "$DURACION" ] && break

  # Docker tarda ~1-2 s en responder: se pide primero y el host se mide en el mismo intervalo
  stats=$(docker stats --no-stream --format '{{.Name}},{{.CPUPerc}},{{.MemUsage}}' 2>/dev/null)
  read -r t1 i1 s1 < <(leer_cpu)
  host=$(awk -v t0="$t0" -v t1="$t1" -v i0="$i0" -v i1="$i1" -v s0="$s0" -v s1="$s1" \
    'BEGIN { dt = t1 - t0; if (dt <= 0) dt = 1; printf "%.1f,%.1f", 100 * (dt - (i1 - i0)) / dt, 100 * (s1 - s0) / dt }')
  t0=$t1; i0=$i1; s0=$s1
  mem=$(awk '/MemTotal/{t=$2} /MemAvailable/{a=$2} END { printf "%.0f,%.0f", (t - a) / 1024, a / 1024 }' /proc/meminfo)
  carga=$(cut -d' ' -f1 /proc/loadavg)

  linea="$transcurrido,$host,$mem,$carga"
  for c in $CONTENEDORES; do
    # El nombre es "<proyecto>-<servicio>-<n>"; MemUsage viene como "375MiB / 1GiB"
    fila=$(echo "$stats" | awk -F, -v c="$c" '$1 ~ ("-" c "-[0-9]+$") { print $2 "," $3; exit }')
    cpu=$(echo "$fila" | cut -d, -f1 | tr -d '% ')
    memc=$(echo "$fila" | cut -d, -f2 | awk '{ split($1, a, "/"); v = a[1]; u = v; gsub(/[0-9.]/, "", u); gsub(/[A-Za-z]/, "", v); \
      if (u ~ /^GiB/) v *= 1024; else if (u ~ /^KiB/) v /= 1024; else if (u ~ /^B$/) v /= 1048576; printf "%.1f", v }')
    linea="$linea,${cpu:-},${memc:-}"
  done
  echo "$linea" >> "$SALIDA"
done
echo "Muestreo terminado: $SALIDA ($(($(wc -l < "$SALIDA") - 1)) muestras)" >&2
