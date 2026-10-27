# Despliegue automatico en AWS Lightsail

Guia para configurar el despliegue con GitHub Actions en una instancia de Lightsail. El flujo es:

```
push a production
   -> job "pruebas" (typecheck y pruebas del backend)
   -> aprobacion manual (Environment "production")
   -> job "desplegar": SSH al servidor, git checkout del commit, docker compose up -d --build
   -> verificacion; si falla, vuelve solo a la version anterior
```

Archivos que intervienen:

| Archivo | Para que sirve |
| :--- | :--- |
| `.github/workflows/deploy-lightsail.yml` | El workflow |
| `deploy/desplegar.sh` | Se ejecuta en el servidor (el workflow lo envia por SSH): despliega, verifica y vuelve atras si falla |
| `deploy/preparar-servidor.sh` | Se ejecuta una sola vez en el servidor nuevo: instala Docker, crea el usuario `deploy`, clona el repo, endurece SSH |
| `docker-compose.yml` + `docker-compose.prod.yml` | Lo que se levanta en el servidor (ver README) |

## Que conecta a que

- **Servidor a GitHub:** no hace falta configurar nada. El repositorio es publico y el servidor lo clona por HTTPS sin credenciales.
- **GitHub al servidor:** el workflow entra por SSH con una llave dedicada. La publica queda en el servidor y la privada en un secret de GitHub. No se instala ningun agente ni runner propio (en un repositorio publico un runner propio permitiria que un pull request de un fork ejecute codigo en tu servidor).

Los secretos de la aplicacion (`.env` de produccion) viven solo en el servidor y nunca pasan por GitHub.

## 1. Crear la instancia en Lightsail

1. Plataforma Linux, plano **Ubuntu 24.04 LTS** (o 22.04), con **2 vCPU y 4 GB de RAM** como minimo recomendado.
2. En la pestana de red: crea y adjunta una **IP estatica**.
3. Firewall de la instancia: deja abiertos **22 (SSH)**, **80 (HTTP)** y **443 (HTTPS)**. El puerto 22 queda abierto a internet porque GitHub Actions no tiene una IP fija; se protege con llave unica, contrasena desactivada y fail2ban (lo instala el script).
4. Activa los **snapshots automaticos** diarios.
5. Descarga la llave por defecto de Lightsail (`.pem`). Es **tuya**: no la subas a GitHub ni la compartas. Solo sirve para tu primer acceso.

## 2. Generar la llave de despliegue

En tu equipo (no uses el `.pem` de Lightsail para esto):

```bash
ssh-keygen -t ed25519 -f deploy_key -N "" -C "github-actions-ecocampus"
```

Genera `deploy_key` (privada, ira a GitHub) y `deploy_key.pub` (publica, ira al servidor). No los subas al repositorio.

## 3. Preparar el servidor (una sola vez)

Conectate con el `.pem` de Lightsail (el usuario por defecto en Ubuntu es `ubuntu`):

```bash
ssh -i ruta/a/LightsailDefaultKey.pem ubuntu@TU_IP
```

Descarga el script, revisalo y ejecutalo pasandole la **llave publica** de despliegue:

```bash
curl -fsSL https://raw.githubusercontent.com/SEBASTIANTORRESL0K1/ecocampus/production/deploy/preparar-servidor.sh -o preparar-servidor.sh
less preparar-servidor.sh
sudo bash preparar-servidor.sh "ssh-ed25519 AAAA...contenido de deploy_key.pub... github-actions-ecocampus"
```

El script instala Docker (repositorio oficial), crea el usuario `deploy` (solo acceso con llave, grupo `docker`), clona el repositorio en `/opt/ecocampus`, desactiva el acceso SSH por contrasena e instala fail2ban. Se puede volver a ejecutar sin problema.

Antes de cerrar la sesion, **abre otra terminal y comprueba que entras como `deploy`** con la llave de despliegue:

```bash
ssh -i deploy_key deploy@TU_IP "docker compose version && cd /opt/ecocampus && git log --oneline -1"
```

## 4. Crear el `.env` de produccion y el primer arranque

Como usuario `deploy`, en el servidor:

```bash
cd /opt/ecocampus
cp .env.prod.example .env
nano .env        # completa TODAS las variables (ver la seccion de produccion del README)
```

Puntos a cuidar:

- `COMPOSE_FILE=docker-compose.yml;docker-compose.prod.yml` debe quedar tal cual: el script de despliegue se niega a continuar si el `.env` no apunta al compose de produccion.
- Genera los secretos con `openssl rand -hex 32` (`MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD`, `SESSION_SECRET`, `ID_SALT`).
- Sin dominio todavia: `SITE_ADDRESS=:80` y usa `http://TU_IP` en `API_URL`, `FRONTEND_URL` (con `/ecocampus/calculadora`) y los callbacks SAML. Con dominio: el dominio en `SITE_ADDRESS`, URLs con `https://` y `COOKIE_SECURE=true`.
- El login SAML necesita el EntityID, los certificados y el callback propios de sistemas@ucol.mx. Hasta tenerlos, el login con las credenciales de desarrollo no funciona para usuarios remotos.

Primer arranque manual (para comprobar que todo funciona antes de automatizar):

```bash
docker compose up -d --build
docker compose ps
curl -s http://localhost/api/me
```

## 5. Configurar GitHub

### Secrets (Settings > Secrets and variables > Actions > New repository secret)

| Secret | Valor |
| :--- | :--- |
| `LIGHTSAIL_HOST` | La IP estatica de la instancia |
| `LIGHTSAIL_USER` | `deploy` |
| `LIGHTSAIL_SSH_KEY` | El contenido completo de `deploy_key` (la privada), incluidas las lineas `BEGIN` y `END` |
| `LIGHTSAIL_KNOWN_HOSTS` | La salida de `ssh-keyscan -t ed25519 TU_IP` (fija la huella del servidor para que nadie lo suplante) |

### Variables (pestana Variables, opcionales)

| Variable | Valor |
| :--- | :--- |
| `SITIO_URL` | URL publica, por ejemplo `https://ecocampus.ejemplo.mx` o `http://TU_IP`. Si se define, la verificacion tambien comprueba `/api/me` por ahi (cubre Caddy, HTTPS y DNS) |
| `DEPLOY_PATH` | Solo si clonaste en otra carpeta distinta de `/opt/ecocampus` |

### Environment con aprobacion manual

Settings > Environments > New environment, con el nombre **`production`**, y activa **Required reviewers** (agregate a ti). El job de despliegue se queda esperando hasta que apruebes en la pagina del workflow. Los Environments con revisores son gratuitos en repositorios publicos.

## 6. Como funciona un despliegue

1. Haces push a `production` (los cambios que solo tocan `docs/`, `loadtest/` o archivos `.md` no lo disparan).
2. Corren `typecheck` y las pruebas del backend. Si fallan, no se despliega.
3. GitHub espera tu aprobacion.
4. El workflow entra al servidor, hace checkout del commit exacto y ejecuta `docker compose up -d --build`. Nunca usa `down` ni `-v`: los datos de MySQL se conservan.
5. Verifica durante hasta 3 minutos que el backend responda `/health`, que nginx sirva el frontend, que el proxy este activo y, si definiste `SITIO_URL`, que el sitio responda por ahi.
6. **Si la construccion o la verificacion fallan, vuelve solo a la version anterior** y el workflow termina en rojo. Asi el sitio queda siempre en la ultima version que funciono.

Los logs de cada paso se ven en la pestana Actions. En el servidor: `docker compose logs -f backend`.

## 7. Avisos importantes

- **Esquema de la base de datos:** `db/schema.sql` solo se aplica al crear el volumen la primera vez. Si cambias la tabla, el despliegue automatico **no** migra los datos: hay que aplicar el cambio a mano (con respaldo antes).
- **Respaldos:** hazlos antes de iniciar el estudio y periodicamente (comandos en el README, seccion "Respaldo y restauracion de MySQL"). Los snapshots de Lightsail ayudan, pero un `mysqldump` es mas facil de restaurar.
- **Rama desplegada:** hoy es `production`. Cuando el experimento llegue a `main`, cambia `branches` en `.github/workflows/deploy-lightsail.yml` (y la rama del clon en el servidor, con `git -C /opt/ecocampus checkout main`).
- **Ejecucion manual:** el workflow tiene `workflow_dispatch`, pero GitHub solo lo muestra en la pestana Actions cuando el archivo existe en la rama por defecto (`main`).
- **Rotar la llave:** genera otra con `ssh-keygen`, reemplaza la linea en `/home/deploy/.ssh/authorized_keys` y actualiza el secret `LIGHTSAIL_SSH_KEY`.
- **El usuario `deploy` pertenece al grupo `docker`**, lo que equivale a acceso de administrador en ese servidor: por eso la llave es dedicada, y su acceso queda protegido por fail2ban y la contrasena desactivada.

## 8. Problemas frecuentes

| Sintoma | Causa y solucion |
| :--- | :--- |
| `Permission denied (publickey)` | La llave publica no esta en `/home/deploy/.ssh/authorized_keys`, o el secret `LIGHTSAIL_SSH_KEY` esta incompleto (faltan las lineas BEGIN/END o hay espacios). Comprueba con `ssh -i deploy_key deploy@TU_IP` desde tu equipo |
| `Host key verification failed` | `LIGHTSAIL_KNOWN_HOSTS` no corresponde a la IP del servidor. Regeneralo con `ssh-keyscan -t ed25519 TU_IP` |
| `el .env no apunta a docker-compose.prod.yml` | Falta o esta mal `COMPOSE_FILE` en el `.env` del servidor |
| `hay cambios locales sin guardar` | Alguien edito archivos versionados en `/opt/ecocampus`. Revisa con `git status` y restaura (`git checkout -- .`); el `.env` no cuenta porque no esta versionado |
| La construccion se queda sin memoria | Instancia con poca RAM. Crea un swap de 2 GB o sube de plan |
| El workflow espera y nunca arranca el despliegue | Falta aprobarlo en la pagina del workflow (Environment `production`) |

## 9. Pruebas realizadas

`deploy/desplegar.sh` se probo contra un servidor simulado (un clon del repositorio con su propio `.env` de produccion y un proyecto de Docker aparte):

- despliegue desde cero y actualizacion de una version a otra, con la verificacion por URL publica;
- un commit que **no compila** (error de TypeScript): vuelve a la version anterior y termina con codigo 1;
- un commit que compila pero **el proceso sale al arrancar**: vuelve a la version anterior y termina con codigo 1;
- en todos los casos el sitio y la base de datos (que nunca se recrea) siguieron sanos.

Las pruebas descubrieron y corrigieron tres defectos: el script terminaba "con exito" sin verificar porque un comando consumia el resto del script por la entrada estandar, un fallo de construccion no disparaba el regreso a la version anterior, y la comprobacion de nginx usaba `localhost` (que resuelve a IPv6, donde nginx no escucha). `deploy/preparar-servidor.sh` se probo dos veces seguidas en un Ubuntu 24.04 limpio (con systemctl, sshd y docker simulados) y es idempotente. Ambos scripts pasan shellcheck y el workflow pasa actionlint.

Lo que **no** se pudo probar fuera de un servidor real: la instalacion de Docker en la instancia, el acceso SSH desde GitHub Actions con tus secrets y la aprobacion del Environment. Si algo falla en la primera ejecucion, el mensaje del paso fallido indica donde.
