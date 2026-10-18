import crypto from "node:crypto";
import type { Request } from "express";
import type { Config } from "../config/cargar";
import { dominioPermitido } from "./correo";
import type { Participante, ParticipantePublico, PerfilSaml } from "./tipos";

// En modo SAML el estudio es solo para alumnos: uTipo lo asigna el IdP de la UCOL.
export const TIPO_PERMITIDO = "Estudiante";

/** Deriva la identidad del participante del usuario de la sesion; null si no trae ningun identificador. */
export function participanteDe(perfil: PerfilSaml, idSalt: string): Participante | null {
  const metodoAcceso = perfil.metodoAcceso === "correo" ? "correo" : "saml";
  const cuenta = String(perfil.uCuenta || perfil.uCorreo || perfil.nameID || "");
  if (!cuenta) return null;
  return {
    id: crypto.createHash("sha256").update(idSalt + cuenta).digest("hex").slice(0, 16),
    tipo: metodoAcceso === "saml" ? perfil.uTipo || null : null,
    correo: perfil.uCorreo || null,
    metodoAcceso,
  };
}

/**
 * Participante de la sesion actual, o null si no hay sesion o se abrio con otro metodo que el configurado
 * (por ejemplo una sesion SAML que sigue viva despues de cambiar REQUIERE_LOGIN).
 */
export function participanteDeSesion(req: Request, config: Config): Participante | null {
  if (!req.isAuthenticated() || !req.user) return null;
  const participante = participanteDe(req.user, config.idSalt);
  return participante && participante.metodoAcceso === config.modoAcceso ? participante : null;
}

/** SAML: solo estudiantes. Correo: solo los dominios permitidos. */
export function puedeParticipar(p: Participante, config: Config): boolean {
  if (p.metodoAcceso === "saml") return p.tipo === TIPO_PERMITIDO;
  return p.correo !== null && dominioPermitido(p.correo, config.correoDominios);
}

export const aPublico = ({ id, tipo }: Participante): ParticipantePublico => ({ id, tipo });
