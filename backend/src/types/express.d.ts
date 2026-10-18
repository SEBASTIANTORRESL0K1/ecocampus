import type { PerfilSaml } from "../auth/tipos";

// passport guarda el perfil SAML en req.user
declare global {
  namespace Express {
    interface User extends PerfilSaml {}
  }
}

export {};
