-- Agrega el metodo de acceso a una base de datos creada antes del acceso por correo.
-- schema.sql solo corre al crear el volumen de MySQL, por eso una base existente se migra a mano:
--   docker compose exec -T mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' < db/migraciones/001_metodo_acceso.sql
-- Es idempotente solo si la columna aun no existe: si ya existe, MySQL responde ERROR 1060 (duplicate column) y no cambia nada.
-- Las filas existentes quedan como 'saml', que es como se registraron hasta ahora.
ALTER TABLE respuestas
  ADD COLUMN metodo_acceso VARCHAR(10) NOT NULL DEFAULT 'saml' AFTER correo,
  ADD CONSTRAINT ck_metodo_acceso CHECK (metodo_acceso IN ('saml', 'correo'));
