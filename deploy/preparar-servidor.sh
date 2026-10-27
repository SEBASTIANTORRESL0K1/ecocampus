#!/usr/bin/env bash
# Prepara un servidor Ubuntu nuevo (por ejemplo una instancia de AWS Lightsail) para el despliegue automatico.
# Se ejecuta UNA vez, como administrador, y es repetible sin dañar lo ya hecho:
#   sudo bash preparar-servidor.sh "<llave publica SSH de despliegue>"
#
# Hace: instala Docker, crea el usuario "deploy" (solo con llave, dentro del grupo docker), clona el
# repositorio en /opt/ecocampus, instala fail2ban y desactiva el acceso SSH por contraseña.
# NO crea el .env de produccion (contiene secretos): ese paso lo haces tu al terminar.
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Ejecutalo con sudo."; exit 1; }
LLAVE_PUBLICA="${1:?uso: sudo bash preparar-servidor.sh \"<llave publica SSH de despliegue>\"}"
case "$LLAVE_PUBLICA" in ssh-ed25519\ *|ssh-rsa\ *|ecdsa-sha2-*) ;; *) echo "La llave publica no parece valida"; exit 1 ;; esac

REPO="${REPO:-https://github.com/SEBASTIANTORRESL0K1/ecocampus.git}"
RAMA="${RAMA:-production}"
DIR="${DIR:-/opt/ecocampus}"
USUARIO="${USUARIO:-deploy}"

echo "== Paquetes base"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl git fail2ban

echo "== Docker (repositorio oficial)"
# Un Docker instalado con snap no es compatible con el oficial (otro servicio, otras rutas): hay que quitarlo antes.
if command -v snap >/dev/null 2>&1 && snap list docker >/dev/null 2>&1; then
  echo "ERROR: hay un Docker instalado con snap. Quitalo con 'sudo snap remove docker' y vuelve a ejecutar este script."
  exit 1
fi
# Se decide por el servicio (no por el comando docker): un "docker" suelto no basta para que el despliegue funcione.
if ! systemctl cat docker.service >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  # shellcheck disable=SC1091
  . /etc/os-release
  ARQUITECTURA="$(dpkg --print-architecture)"
  # Una sola linea, sin continuacion con barra invertida: al pegar el script en una terminal web ese salto se puede perder
  LINEA_REPO="deb [arch=${ARQUITECTURA} signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable"
  echo "$LINEA_REPO" > /etc/apt/sources.list.d/docker.list
  grep -q 'download.docker.com' /etc/apt/sources.list.d/docker.list || { echo "ERROR: no se pudo escribir /etc/apt/sources.list.d/docker.list"; exit 1; }
  apt-get update -y
  # awk lee toda la salida; "grep -q" cerraria la tuberia antes y, con pipefail, daria un falso error por SIGPIPE
  CANDIDATO="$(apt-cache policy docker-ce | awk '/Candidate:/ {print $2}')"
  { [ -n "$CANDIDATO" ] && [ "$CANDIDATO" != "(none)" ]; } || { echo "ERROR: apt no encuentra docker-ce; revisa /etc/apt/sources.list.d/docker.list"; exit 1; }
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
systemctl enable --now docker
docker compose version >/dev/null 2>&1 || { echo "ERROR: este Docker no incluye el plugin 'docker compose' (v2). Instala docker-compose-plugin o usa el Docker oficial."; exit 1; }

echo "== Usuario de despliegue: $USUARIO"
id "$USUARIO" >/dev/null 2>&1 || adduser --disabled-password --gecos "" "$USUARIO"
usermod -aG docker "$USUARIO"
install -d -m 700 -o "$USUARIO" -g "$USUARIO" "/home/$USUARIO/.ssh"
AUTORIZADAS="/home/$USUARIO/.ssh/authorized_keys"
touch "$AUTORIZADAS"
grep -qxF "$LLAVE_PUBLICA" "$AUTORIZADAS" || echo "$LLAVE_PUBLICA" >> "$AUTORIZADAS"
chown "$USUARIO:$USUARIO" "$AUTORIZADAS"
chmod 600 "$AUTORIZADAS"

echo "== Repositorio en $DIR (rama $RAMA)"
if [ ! -d "$DIR/.git" ]; then
  install -d -o "$USUARIO" -g "$USUARIO" "$DIR"
  sudo -u "$USUARIO" git clone --branch "$RAMA" "$REPO" "$DIR"
else
  echo "   ya existe, no se toca"
fi

echo "== SSH: solo llaves, sin contraseña"
cat > /etc/ssh/sshd_config.d/99-ecocampus.conf <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
EOF
sshd -t
systemctl reload ssh 2>/dev/null || systemctl reload sshd

echo "== fail2ban (bloquea IP con intentos SSH repetidos)"
systemctl enable --now fail2ban

echo
echo "Listo. Pendiente (a mano, como usuario $USUARIO):"
echo "  1. cd $DIR && cp .env.prod.example .env   y completar TODAS las variables"
echo "  2. docker compose up -d --build           (primer arranque manual)"
echo "  3. Configurar los secrets en GitHub (ver docs/despliegue-lightsail.md)"
