#!/usr/bin/env bash
# Despliega un commit en el servidor y vuelve a la version anterior si no pasa la verificacion.
# Lo ejecuta el workflow deploy-lightsail.yml por SSH, enviando este archivo por la entrada estandar:
#   ssh usuario@servidor 'bash -s -- <sha> [ruta] [url-publica]' < deploy/desplegar.sh
#
#   sha          commit exacto a desplegar
#   ruta         carpeta del repositorio en el servidor (por defecto /opt/ecocampus)
#   url-publica  opcional, por ejemplo https://ecocampus.ejemplo.mx; si se da, tambien se verifica /api/me por ahi
#   INTENTOS     variable de entorno opcional: intentos de 5 s para la verificacion (por defecto 36 = 3 minutos)
#
# NUNCA usa "docker compose down" ni "-v": los datos de MySQL viven en el volumen db_data y se conservan.
#
# IMPORTANTE: como bash lee este script por la entrada estandar (bash -s), cualquier comando que tambien lea
# la entrada estandar se "comeria" el resto del script y este terminaria sin verificar nada. Por eso todo el
# codigo esta dentro de main() (bash lo lee completo antes de ejecutarlo) y docker compose lee de /dev/null.
set -euo pipefail

compose() { docker compose "$@" < /dev/null; }

# La salida se captura en una variable y se compara: "cmd | grep -q" con pipefail da falsos fallos por SIGPIPE
# (grep -q cierra la tuberia al primer acierto y el comando recibe SIGPIPE).
backend_sano()  { local r; r="$(compose exec -T backend wget -qO- http://localhost:4006/health 2>/dev/null)" || return 1; [[ "$r" == *'"status":"ok"'* ]]; }
frontend_sano() { compose exec -T frontend wget -qO /dev/null http://127.0.0.1/ecocampus/ 2>/dev/null; }
proxy_activo()  { local r; r="$(compose ps --status running --services 2>/dev/null)" || return 1; [[ $'\n'"$r"$'\n' == *$'\nproxy\n'* ]]; }
sitio_publico() { [ -z "$URL" ] && return 0; local r; r="$(curl -fsS --max-time 10 "$URL/api/me" 2>/dev/null)" || return 1; [[ "$r" == *'"authenticated"'* ]]; }

verificar() {
  local i
  for ((i = 1; i <= INTENTOS; i++)); do
    if backend_sano && frontend_sano && proxy_activo && sitio_publico; then
      echo "== Verificacion correcta (intento $i)"
      return 0
    fi
    sleep 5
  done
  return 1
}

publicar() {
  git -c advice.detachedHead=false checkout --detach "$1"
  compose up -d --build --remove-orphans
}

main() {
  SHA="${1:?uso: desplegar.sh <sha> [ruta] [url-publica]}"
  DIR="${2:-/opt/ecocampus}"
  URL="${3:-}"
  INTENTOS="${INTENTOS:-36}"

  cd "$DIR"

  [ -f .env ] || { echo "ERROR: falta $DIR/.env (copia .env.prod.example y completalo)"; exit 1; }
  grep -q 'docker-compose.prod.yml' .env || { echo "ERROR: el .env no apunta a docker-compose.prod.yml (COMPOSE_FILE); abortando para no desplegar un entorno equivocado"; exit 1; }
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "ERROR: hay cambios locales sin guardar en $DIR; abortando"
    exit 1
  fi

  local anterior
  anterior="$(git rev-parse HEAD)"
  echo "== Version actual:   ${anterior:0:12}"
  echo "== Version a subir:  ${SHA:0:12}"

  git fetch --prune origin < /dev/null
  git cat-file -e "${SHA}^{commit}" || { echo "ERROR: el commit $SHA no existe en el remoto"; exit 1; }

  # Si falla la construccion o la verificacion, se vuelve a la version anterior
  if publicar "$SHA" && verificar; then
    docker image prune -f > /dev/null < /dev/null
    echo "== Despliegue correcto: ${SHA:0:12}"
    return 0
  fi

  echo "!! La construccion o la verificacion fallo. Ultimos registros:"
  compose ps || true
  compose logs --tail=40 backend proxy || true

  if [ "$anterior" = "$SHA" ]; then
    echo "!! No hay version anterior distinta a la que fallo; no se puede volver atras."
    return 1
  fi

  echo "== Volviendo a la version anterior: ${anterior:0:12}"
  if publicar "$anterior" && verificar; then
    echo "== Se restauro la version anterior; el despliegue de ${SHA:0:12} FALLO."
  else
    echo "!! Tampoco la version anterior quedo sana: revisa el servidor a mano."
  fi
  return 1
}

main "$@"
