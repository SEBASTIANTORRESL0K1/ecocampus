require("dotenv").config();
const crypto = require("crypto");
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const saml = require("@node-saml/passport-saml");
const cors = require("cors");

const PORT = 4006;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173/ecocampus/calculadora";
const FRONTEND_ORIGIN = new URL(FRONTEND_URL).origin;
const SESSION_SECRET = process.env.SESSION_SECRET || "ecocampus-dev-secret-cambiar-en-produccion";
const ID_SALT = process.env.ID_SALT || "ecocampus-dev-salt-cambiar-en-produccion";

const app = express();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const samlStrategy = new saml.Strategy(
  {
    callbackUrl: "http://localhost:4006/login/callback",
    entryPoint: "https://wayf.ucol.mx/saml2/idp/SSOService.php",
    logoutUrl: "https://wayf.ucol.mx/saml2/idp/SingleLogoutService.php",
    logoutCallbackUrl: "http://localhost:4006/logout/callback",
    issuer: "http://localhost/20166932",
    decryptionPvk: fs.readFileSync(__dirname + "/cert/key.pem", "utf8"),
    idpCert: fs.readFileSync(__dirname + "/cert/idp.crt", "utf8"),
    // El IdP de UCOL tiene desfase de reloj; -1 desactiva la validacion de timestamps.
    // En produccion usar el desfase real en ms.
    acceptedClockSkewMs: -1,
  },
  (profile, done) => done(null, profile)
);

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(
  session({
    secret: SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: { httpOnly: true, sameSite: "lax" },
  })
);
passport.use(samlStrategy);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Id pseudonimo estable: no se expone correo, nombre ni cuenta al frontend.
function participanteDe(user) {
  const cuenta = String(user.uCuenta || user.uCorreo || user.nameID || "");
  if (!cuenta) return null;
  return {
    id: crypto.createHash("sha256").update(ID_SALT + cuenta).digest("hex").slice(0, 16),
    tipo: user.uTipo || null,
  };
}

app.get("/", (_req, res) => res.redirect("/login"));

app.get(
  "/login",
  passport.authenticate("saml", { failureRedirect: "/login/fail" }),
  (_req, res) => res.redirect(FRONTEND_URL)
);

// callbackUrl registrado ante el IdP es /login/callback; /api/auth/... se deja por compatibilidad con la demo original.
const alTerminarLogin = (_req, res) => res.redirect(FRONTEND_URL);
const autenticarCallback = passport.authenticate("saml", { failureRedirect: "/login/fail" });
app.post("/login/callback", autenticarCallback, alTerminarLogin);
app.post("/api/auth/login/callback", autenticarCallback, alTerminarLogin);

// El estudio es solo para alumnos: uTipo lo asigna el IdP de la UCOL.
const TIPO_PERMITIDO = "Estudiante";

app.get("/api/me", (req, res) => {
  const autenticado = req.isAuthenticated();
  const participante = autenticado ? participanteDe(req.user) : null;
  const permitido = Boolean(participante) && participante.tipo === TIPO_PERMITIDO;
  res.json({ authenticated: autenticado, permitido, participante: permitido ? participante : null });
});

app.get("/logout", (req, res) => {
  if (!req.user) return res.redirect(FRONTEND_URL);
  samlStrategy.logout(req, (_err, url) => res.redirect(url));
});

const alTerminarLogout = (req, res) => req.logout(() => res.redirect(FRONTEND_URL));
app.post("/logout/callback", alTerminarLogout);
app.post("/api/auth/logout/callback", alTerminarLogout);

app.get("/login/fail", (_req, res) => res.status(401).send("Login failed"));

app.get("/Metadata", (_req, res) => {
  res.type("application/xml");
  res.send(samlStrategy.generateServiceProviderMetadata(fs.readFileSync(__dirname + "/cert/cert.pem", "utf8")));
});

app.use((err, _req, _res, next) => {
  console.error("Error:", err.message);
  next(err);
});

app.listen(PORT, () => console.log(`Backend de login escuchando en http://localhost:${PORT}`));
