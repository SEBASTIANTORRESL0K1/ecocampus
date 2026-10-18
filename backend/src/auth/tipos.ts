export type MetodoAcceso = "saml" | "correo";

/**
 * Usuario guardado en la sesion. En modo SAML es el perfil que devuelve el IdP de la UCOL (todos los atributos
 * son opcionales: dependen de la cuenta); en modo correo solo trae metodoAcceso y uCorreo.
 */
export interface PerfilSaml {
  nameID?: string;
  sessionIndex?: string;
  uCuenta?: string;
  uCorreo?: string;
  uNombre?: string;
  uTipo?: string;
  uDependencia?: string;
  metodoAcceso?: MetodoAcceso;
  [atributo: string]: unknown;
}

/** Identidad pseudonima del participante, calculada en el servidor. */
export interface Participante {
  id: string;
  tipo: string | null;
  correo: string | null;
  metodoAcceso: MetodoAcceso;
}

/** Lo unico que el navegador puede ver del participante (nunca el correo, el nombre ni la cuenta). */
export type ParticipantePublico = Pick<Participante, "id" | "tipo">;
