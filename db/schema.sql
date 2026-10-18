-- Respuestas del experimento: una fila por participante.
-- Se ejecuta solo la primera vez que se crea el volumen de MySQL.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS respuestas (
  id                     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  creado_en              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  participante_id        CHAR(16) NULL,
  correo                 VARCHAR(255) NULL,
  -- Como entro el participante: 'saml' (login federado UCOL) o 'correo' (solo el correo, sin verificar)
  metodo_acceso          VARCHAR(10) NOT NULL DEFAULT 'saml',

  edad                   TINYINT UNSIGNED NOT NULL,
  sexo                   VARCHAR(30) NOT NULL,
  carrera                VARCHAR(80) NOT NULL,
  semestre               VARCHAR(2) NOT NULL,
  conocia_calculadora    VARCHAR(2) NOT NULL,
  completo_calculo       VARCHAR(2) NOT NULL,
  pregunta_sin_respuesta TEXT NULL,
  tiempo_min             SMALLINT UNSIGNED NOT NULL,
  planetas               VARCHAR(20) NOT NULL,

  u9  TINYINT UNSIGNED NOT NULL, u10 TINYINT UNSIGNED NOT NULL, u11 TINYINT UNSIGNED NOT NULL,
  u12 TINYINT UNSIGNED NOT NULL, u13 TINYINT UNSIGNED NOT NULL, u14 TINYINT UNSIGNED NOT NULL,
  u15 TINYINT UNSIGNED NOT NULL, u16 TINYINT UNSIGNED NOT NULL, u17 TINYINT UNSIGNED NOT NULL,
  u18 TINYINT UNSIGNED NOT NULL,
  c19 TINYINT UNSIGNED NOT NULL, c20 TINYINT UNSIGNED NOT NULL, c21 TINYINT UNSIGNED NOT NULL,
  c22 TINYINT UNSIGNED NOT NULL,
  i23 TINYINT UNSIGNED NOT NULL, i24 TINYINT UNSIGNED NOT NULL,

  habito_cambiar         TEXT NULL,
  mayor_dificultad       TEXT NULL,
  comentarios            TEXT NULL,

  PRIMARY KEY (id),
  -- Siempre se guardan (no hay envios anonimos); MySQL permite varios NULL en un UNIQUE solo en filas antiguas.
  UNIQUE KEY uq_participante (participante_id),
  UNIQUE KEY uq_correo (correo),

  CONSTRAINT ck_metodo_acceso CHECK (metodo_acceso IN ('saml', 'correo')),
  CONSTRAINT ck_edad CHECK (edad BETWEEN 15 AND 99),
  CONSTRAINT ck_likert CHECK (
    u9  BETWEEN 1 AND 5 AND u10 BETWEEN 1 AND 5 AND u11 BETWEEN 1 AND 5 AND u12 BETWEEN 1 AND 5 AND
    u13 BETWEEN 1 AND 5 AND u14 BETWEEN 1 AND 5 AND u15 BETWEEN 1 AND 5 AND u16 BETWEEN 1 AND 5 AND
    u17 BETWEEN 1 AND 5 AND u18 BETWEEN 1 AND 5 AND c19 BETWEEN 1 AND 5 AND c20 BETWEEN 1 AND 5 AND
    c21 BETWEEN 1 AND 5 AND c22 BETWEEN 1 AND 5 AND i23 BETWEEN 1 AND 5 AND i24 BETWEEN 1 AND 5
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
