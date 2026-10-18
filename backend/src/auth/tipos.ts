/** Perfil que devuelve el IdP de la UCOL (atributos SAML). Todos opcionales: dependen de la cuenta. */
export interface PerfilSaml {
  nameID?: string;
  sessionIndex?: string;
  uCuenta?: string;
  uCorreo?: string;
  uNombre?: string;
  uTipo?: string;
  uDependencia?: string;
  [atributo: string]: unknown;
}

/** Identidad pseudonima del participante, calculada en el servidor. */
export interface Participante {
  id: string;
  tipo: string | null;
  correo: string | null;
}

/** Lo unico que el navegador puede ver del participante (nunca el correo, el nombre ni la cuenta). */
export type ParticipantePublico = Pick<Participante, "id" | "tipo">;
