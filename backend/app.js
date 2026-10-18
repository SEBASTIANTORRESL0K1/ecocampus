require("dotenv").config();
const crypto = require("crypto");
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const saml = require("@node-saml/passport-saml");
const cors = require("cors");
const MySQLStore = require("express-mysql-session")(session);
const { crearPool, esperarBD } = require("./db");
const { validarRespuesta, COLUMNAS } = require("./validacion");

const PORT = Number(process.env.PORT) || 4006;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173/ecocampus/calculadora";
const FRONTEND_ORIGIN = new URL(FRONTEND_URL).origin;
const SESSION_SECRET = process.env.SESSION_SECRET || "ecocampus-dev-secret-cambiar-en-produccion";
const ID_SALT = process.env.ID_SALT || "ecocampus-dev-salt-cambiar-en-produccion";
// REQUIERE_LOGIN=false permite guardar respuestas sin sesion (solo desarrollo).
const REQUIERE_LOGIN = process.env.REQUIERE_LOGIN !== "false";
// Detras de nginx/ALB con HTTPS: COOKIE_SECURE=true y TRUST_PROXY=true.
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";
const TRUST_PROXY = process.env.TRUST_PROXY === "true";

// SAML: los valores por defecto son los de desarrollo que entrego el asesor (UCOL). En produccion se
// sobrescriben con variables de entorno (EntityID, callback y certificados propios de sistemas@ucol.mx).
const SAML_ISSUER_DEV = "http://localhost/20166932";
const SAML = {
  issuer: process.env.SAML_ISSUER || SAML_ISSUER_DEV,
  callbackUrl: process.env.SAML_CALLBACK_URL || "http://localhost:4006/login/callback",
  logoutCallbackUrl: process.env.SAML_LOGOUT_CALLBACK_URL || "http://localhost:4006/logout/callback",
  entryPoint: process.env.SAML_ENTRY_POINT || "https://wayf.ucol.mx/saml2/idp/SSOService.php",
  logoutUrl: process.env.SAML_LOGOUT_URL || "https://wayf.ucol.mx/saml2/idp/SingleLogoutService.php",
  certDir: process.env.SAML_CERT_DIR || __dirname + "/cert",
  // -1 desactiva la validacion de timestamps (desfase de reloj del IdP de UCOL); en produccion usar el desfase real en ms.
  clockSkewMs: process.env.SAML_CLOCK_SKEW_MS ? Number(process.env.SAML_CLOCK_SKEW_MS) : -1,
};

// Logs con hora y nivel. Nunca se registran correos, nombres, cuentas ni respuestas SAML completas.
function log(nivel, mensaje, extra) {
  const linea = `${new Date().toISOString()} [${nivel.toUpperCase()}] ${mensaje}`;
  const salida = nivel === "error" ? console.error : nivel === "warn" ? console.warn : console.log;
  extra === undefined ? salida(linea) : salida(linea, extra);
}

process.on("unhandledRejection", (motivo) => log("error", "unhandledRejection", motivo));
process.on("uncaughtException", (err) => log("error", "uncaughtException", err.stack || err));

const app = express();
const pool = crearPool();
if (TRUST_PROXY) app.set("trust proxy", 1);

app.use((req, res, next) => {
  const inicio = Date.now();
  res.on("finish", () => {
    const nivel = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    log(nivel, `${req.method} ${req.path} ${res.statusCode} ${Date.now() - inicio}ms`);
  });
  next();
});

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const samlStrategy = new saml.Strategy(
  {
    callbackUrl: SAML.callbackUrl,
    entryPoint: SAML.entryPoint,
    logoutUrl: SAML.logoutUrl,
    logoutCallbackUrl: SAML.logoutCallbackUrl,
    issuer: SAML.issuer,
    decryptionPvk: fs.readFileSync(SAML.certDir + "/key.pem", "utf8"),
    idpCert: fs.readFileSync(SAML.certDir + "/idp.crt", "utf8"),
    acceptedClockSkewMs: SAML.clockSkewMs,
  },
  (profile, done) => done(null, profile)
);

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(
  session({
    secret: SESSION_SECRET,
    store: new MySQLStore({}, pool),
    saveUninitialized: false,
    resave: false,
    cookie: { httpOnly: true, sameSite: "lax", secure: COOKIE_SECURE },
  })
);
passport.use(samlStrategy);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// El navegador nunca recibe correo, nombre ni cuenta: se leen de la sesion SAML en el servidor.
function participanteDe(user) {
  const cuenta = String(user.uCuenta || user.uCorreo || user.nameID || "");
  if (!cuenta) return null;
  return {
    id: crypto.createHash("sha256").update(ID_SALT + cuenta).digest("hex").slice(0, 16),
    tipo: user.uTipo || null,
    correo: user.uCorreo || null,
  };
}

const quitarCorreo = ({ id, tipo }) => ({ id, tipo });

app.get("/", (_req, res) => res.redirect("/login"));

app.get(
  "/login",
  passport.authenticate("saml", { failureRedirect: "/login/fail" }),
  (_req, res) => res.redirect(FRONTEND_URL)
);

// callbackUrl registrado ante el IdP es /login/callback; /api/auth/... se deja por compatibilidad con la demo original.
const autenticarCallback = (req, res, next) => {
  passport.authenticate("saml", (err, user, info) => {
    if (err) {
      log("error", `Login SAML fallo: ${err.message}`, err.stack);
      return res.redirect("/login/fail");
    }
    if (!user) {
      log("warn", "Login SAML sin usuario", info);
      return res.redirect("/login/fail");
    }
    req.logIn(user, (errSesion) => {
      if (errSesion) {
        log("error", `No se pudo crear la sesion: ${errSesion.message}`, errSesion.stack);
        return res.redirect("/login/fail");
      }
      const participante = participanteDe(user);
      log("info", `Login OK participante=${participante?.id} tipo=${participante?.tipo}`);
      if (!participante) log("warn", "El perfil SAML no trae uCuenta, uCorreo ni nameID");
      res.redirect(FRONTEND_URL);
    });
  })(req, res, next);
};
app.post("/login/callback", autenticarCallback);
app.post("/api/auth/login/callback", autenticarCallback);

// El estudio es solo para alumnos: uTipo lo asigna el IdP de la UCOL.
const TIPO_PERMITIDO = "Estudiante";

app.get("/api/me", (req, res) => {
  const autenticado = req.isAuthenticated();
  const participante = autenticado ? participanteDe(req.user) : null;
  const permitido = Boolean(participante) && participante.tipo === TIPO_PERMITIDO;
  if (autenticado && !permitido) log("warn", `Acceso denegado participante=${participante?.id} tipo=${participante?.tipo}`);
  res.json({
    authenticated: autenticado,
    permitido,
    participante: permitido ? quitarCorreo(participante) : null,
  });
});

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    log("error", `Health check: MySQL no responde (${err.code || err.message})`);
    res.status(503).json({ status: "db-down" });
  }
});

app.post("/api/respuestas", async (req, res) => {
  let participante = null;
  if (REQUIERE_LOGIN) {
    participante = req.isAuthenticated() ? participanteDe(req.user) : null;
    if (!participante) return res.status(401).json({ success: false, error: "sin-sesion" });
    if (participante.tipo !== TIPO_PERMITIDO) {
      log("warn", `Envio rechazado participante=${participante.id} tipo=${participante.tipo}`);
      return res.status(403).json({ success: false, error: "no-permitido" });
    }
  }

  const validacion = validarRespuesta(req.body, participante);
  if (!validacion.ok) {
    log("warn", `Respuesta invalida participante=${participante?.id ?? "-"}: ${validacion.errores.join("; ")}`);
    return res.status(400).json({ success: false, error: "invalido", detalle: validacion.errores });
  }

  try {
    const sql = `INSERT INTO respuestas (${COLUMNAS.join(", ")}) VALUES (${COLUMNAS.map(() => "?").join(", ")})`;
    const [resultado] = await pool.query(sql, COLUMNAS.map((c) => validacion.datos[c]));
    log("info", `Respuesta guardada id=${resultado.insertId} participante=${participante?.id ?? "-"}`);
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      log("warn", `Participacion duplicada participante=${participante?.id ?? "-"}`);
      return res.status(409).json({ success: false, error: "duplicado" });
    }
    log("error", `No se pudo guardar la respuesta: ${err.code || err.message}`, err.stack);
    res.status(500).json({ success: false, error: "error-interno" });
  }
});

app.get("/logout", (req, res) => {
  if (!req.user) return res.redirect(FRONTEND_URL);
  samlStrategy.logout(req, (err, url) => {
    if (err) {
      log("error", `Logout SAML fallo: ${err.message}`, err.stack);
      return res.redirect(FRONTEND_URL);
    }
    res.redirect(url);
  });
});

const alTerminarLogout = (req, res) =>
  req.logout(() => {
    log("info", "Logout completado");
    res.redirect(FRONTEND_URL);
  });
app.post("/logout/callback", alTerminarLogout);
app.post("/api/auth/logout/callback", alTerminarLogout);

app.get("/login/fail", (_req, res) => res.status(401).send("Login failed"));

app.get("/Metadata", (_req, res) => {
  res.type("application/xml");
  res.send(samlStrategy.generateServiceProviderMetadata(fs.readFileSync(SAML.certDir + "/cert.pem", "utf8")));
});

app.use((err, req, res, _next) => {
  log("error", `Error no controlado en ${req.method} ${req.path}: ${err.message}`, err.stack);
  if (!res.headersSent) res.status(500).send("Error interno");
});

esperarBD(pool, log)
  .then(() => {
    app.listen(PORT, () => {
      log("info", `Backend escuchando en http://localhost:${PORT} (MySQL conectado)`);
      log("info", `FRONTEND_URL=${FRONTEND_URL} (origen CORS: ${FRONTEND_ORIGIN}) REQUIERE_LOGIN=${REQUIERE_LOGIN}`);
      if (process.env.NODE_ENV === "production" && SAML.issuer === SAML_ISSUER_DEV) {
        log("warn", "Produccion con el EntityID de desarrollo: el login solo funciona con callback en localhost:4006");
      }
      if (!process.env.SESSION_SECRET || !process.env.ID_SALT) {
        log("warn", "SESSION_SECRET o ID_SALT no definidos: usando valores de desarrollo");
      }
    });
  })
  .catch((err) => {
    log("error", err.message);
    process.exit(1);
  });
