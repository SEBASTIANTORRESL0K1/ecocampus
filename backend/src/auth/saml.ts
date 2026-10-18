import fs from "node:fs";
import path from "node:path";
import { Strategy as SamlStrategy, type Profile, type VerifiedCallback } from "@node-saml/passport-saml";
import type { Config } from "../config/cargar";

export function crearEstrategiaSaml(saml: Config["saml"]): SamlStrategy {
  const leer = (archivo: string) => fs.readFileSync(path.join(saml.certDir, archivo), "utf8");
  return new SamlStrategy(
    {
      callbackUrl: saml.callbackUrl,
      entryPoint: saml.entryPoint,
      logoutUrl: saml.logoutUrl,
      logoutCallbackUrl: saml.logoutCallbackUrl,
      issuer: saml.issuer,
      decryptionPvk: leer("key.pem"),
      idpCert: leer("idp.crt"),
      acceptedClockSkewMs: saml.clockSkewMs,
    },
    // El perfil SAML se guarda tal cual en la sesion (passport.serializeUser)
    (perfil: Profile | null, done: VerifiedCallback) => done(null, perfil ?? {}),
    (perfil: Profile | null, done: VerifiedCallback) => done(null, perfil ?? {})
  );
}

/** Metadatos del proveedor de servicio (los que se entregan a sistemas@ucol.mx). */
export function metadatosSp(estrategia: SamlStrategy, saml: Config["saml"]): string {
  return estrategia.generateServiceProviderMetadata(fs.readFileSync(path.join(saml.certDir, "cert.pem"), "utf8"));
}
