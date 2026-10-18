import crypto from "node:crypto";
import type { Participante, ParticipantePublico, PerfilSaml } from "./tipos";

// El estudio es solo para alumnos: uTipo lo asigna el IdP de la UCOL.
export const TIPO_PERMITIDO = "Estudiante";

/** Deriva la identidad del participante del perfil SAML; null si el perfil no trae ningun identificador. */
export function participanteDe(perfil: PerfilSaml, idSalt: string): Participante | null {
  const cuenta = String(perfil.uCuenta || perfil.uCorreo || perfil.nameID || "");
  if (!cuenta) return null;
  return {
    id: crypto.createHash("sha256").update(idSalt + cuenta).digest("hex").slice(0, 16),
    tipo: perfil.uTipo || null,
    correo: perfil.uCorreo || null,
  };
}

// Devuelve boolean (no un type guard): un participante que no es estudiante sigue siendo un Participante.
export const esEstudiante = (p: Participante): boolean => p.tipo === TIPO_PERMITIDO;

export const aPublico = ({ id, tipo }: Participante): ParticipantePublico => ({ id, tipo });
