import { CARRERA, MAX_TEXTO, PLANETAS, SEMESTRE, SEXO, SI_NO } from "../validacion/respuestas";

// Especificacion OpenAPI 3.1 de la API. Reutiliza las constantes de validacion (opciones y limites)
// para no duplicar valores; las pruebas (especificacion.test.ts) comprueban que no se desalinee del codigo:
// cada ruta registrada en Express debe estar aqui, y los campos obligatorios deben coincidir con el esquema Zod.

const likert = (descripcion: string) => ({
  type: "integer",
  minimum: 1,
  maximum: 5,
  description: `${descripcion}. Escala de 1 (totalmente en desacuerdo) a 5 (totalmente de acuerdo).`,
});

const textoAbierto = (descripcion: string) => ({
  type: "string",
  maxLength: MAX_TEXTO,
  description: `${descripcion}. Opcional; una cadena vacia se guarda como nula.`,
});

export const ejemploRespuestas = {
  "1": 21,
  S1: "Femenino",
  "2": "Ingeniería en Software",
  "3": "3",
  "4": "Sí",
  "5": "Sí",
  "9": 4, "10": 2, "11": 4, "12": 2, "13": 4, "14": 2, "15": 4, "16": 2, "17": 4, "18": 2,
  "19": 4, "20": 3, "21": 4, "22": 4,
  "23": 4, "24": 5,
  "25": "Reducir el consumo de carne",
};

export const ejemploCuerpo = { respuestas: ejemploRespuestas, tiempoMin: 7, planetas: "entre 1 y 2" };

const redireccion = (descripcion: string) => ({ description: descripcion, headers: { Location: { schema: { type: "string" } } } });

const errorRespuesta = (codigo: string, descripcion: string) => ({
  description: descripcion,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorRespuesta" },
      example: { success: false, error: codigo },
    },
  },
});

const cuerpoCallbackSaml = {
  content: {
    "application/x-www-form-urlencoded": {
      schema: { type: "object", properties: { SAMLResponse: { type: "string", description: "Aserción SAML en base64" } } },
    },
  },
};

export const especificacion = {
  openapi: "3.1.0",
  info: {
    title: "EcoCampus API",
    version: "1.0.0",
    description: [
      "API del modo experimento de EcoCampus: login federado de la Universidad de Colima (SAML) y guardado del cuestionario de evaluación en MySQL.",
      "",
      "- La identidad del participante (id pseudónimo y correo) se toma siempre de la sesión SAML en el servidor; el cuerpo de las peticiones nunca la define.",
      "- El estudio es solo para estudiantes (`uTipo = Estudiante`).",
      "- Hay un único registro por participante y por correo.",
      "- Esta documentación se genera desde el código (`backend/src/openapi/especificacion.ts`). El archivo `docs/openapi.json` del repositorio es su copia.",
    ].join("\n"),
  },
  servers: [{ url: "/", description: "El mismo origen desde el que se sirve la API (en desarrollo, http://localhost:4006)" }],
  tags: [
    { name: "Respuestas", description: "Guardado del cuestionario de evaluación" },
    { name: "Autenticación", description: "Login federado SAML de la Universidad de Colima. Son rutas de navegación (redirecciones), no de una API JSON." },
    { name: "Sistema", description: "Salud del servicio y metadatos" },
  ],
  paths: {
    "/api/respuestas": {
      post: {
        tags: ["Respuestas"],
        summary: "Guarda las respuestas del cuestionario de un participante",
        description:
          "Requiere una sesión SAML de un estudiante (cookie `connect.sid`), salvo que el servidor corra con `REQUIERE_LOGIN=false` (solo desarrollo y pruebas de carga; entonces se guarda sin id ni correo). Valida todos los campos; si alguno es inválido no se guarda nada.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CuerpoRespuesta" },
              example: ejemploCuerpo,
            },
          },
        },
        responses: {
          "201": {
            description: "Respuesta guardada",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ExitoRespuesta" }, example: { success: true } } },
          },
          "400": {
            description: "Algún dato no es válido. `detalle` indica cada campo y el motivo.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorRespuesta" },
                example: { success: false, error: "invalido", detalle: ["respuestas.1: Too small: expected number to be >=15"] },
              },
            },
          },
          "401": errorRespuesta("sin-sesion", "No hay sesión iniciada"),
          "403": errorRespuesta("no-permitido", "La cuenta no es de un estudiante"),
          "409": errorRespuesta("duplicado", "Ese participante (o su correo) ya registró su respuesta"),
          "500": errorRespuesta("error-interno", "Error al guardar en la base de datos"),
        },
      },
    },
    "/api/me": {
      get: {
        tags: ["Autenticación"],
        summary: "Estado de la sesión del navegador",
        description: "Lo usa el frontend para decidir si pide iniciar sesión. Nunca devuelve el correo, el nombre ni el número de cuenta.",
        responses: {
          "200": {
            description: "Estado de la sesión",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EstadoSesion" },
                examples: {
                  sinSesion: { summary: "Sin sesión", value: { authenticated: false, permitido: false, participante: null } },
                  estudiante: { summary: "Estudiante", value: { authenticated: true, permitido: true, participante: { id: "771d57a70fa584e2", tipo: "Estudiante" } } },
                  noEstudiante: { summary: "Cuenta que no es de estudiante", value: { authenticated: true, permitido: false, participante: null } },
                },
              },
            },
          },
        },
      },
    },
    "/login": {
      get: {
        tags: ["Autenticación"],
        summary: "Inicia el login federado",
        description: "Redirige al proveedor de identidad de la UCOL (wayf.ucol.mx). Tras autenticarse, el IdP hace POST a la ruta de callback.",
        responses: { "302": redireccion("Redirección al IdP de la UCOL") },
      },
    },
    "/login/callback": {
      post: {
        tags: ["Autenticación"],
        summary: "Callback SAML del login",
        description: "Lo invoca el navegador por indicación del IdP con la aserción SAML. Crea la sesión y redirige al frontend; si falla, redirige a `/login/fail`.",
        requestBody: cuerpoCallbackSaml,
        responses: { "302": redireccion("Redirección al frontend (login correcto) o a /login/fail") },
      },
    },
    "/api/auth/login/callback": {
      post: {
        tags: ["Autenticación"],
        summary: "Callback SAML del login (ruta que usa el IdP de la UCOL)",
        description: "Equivalente a `/login/callback`. El IdP de la UCOL hace el POST a esta ruta.",
        requestBody: cuerpoCallbackSaml,
        responses: { "302": redireccion("Redirección al frontend (login correcto) o a /login/fail") },
      },
    },
    "/login/fail": {
      get: {
        tags: ["Autenticación"],
        summary: "Login fallido",
        responses: { "401": { description: "Texto plano `Login failed`", content: { "text/plain": { schema: { type: "string" }, example: "Login failed" } } } },
      },
    },
    "/logout": {
      get: {
        tags: ["Autenticación"],
        summary: "Cierra la sesión",
        description: "Con sesión, redirige al IdP para cerrar también la sesión federada; sin sesión, redirige al frontend.",
        responses: { "302": redireccion("Redirección al IdP o al frontend") },
      },
    },
    "/logout/callback": {
      post: {
        tags: ["Autenticación"],
        summary: "Callback del cierre de sesión",
        responses: { "302": redireccion("Redirección al frontend") },
      },
    },
    "/api/auth/logout/callback": {
      post: {
        tags: ["Autenticación"],
        summary: "Callback del cierre de sesión (ruta de la demo original)",
        responses: { "302": redireccion("Redirección al frontend") },
      },
    },
    "/": {
      get: {
        tags: ["Autenticación"],
        summary: "Raíz del backend",
        description: "Redirige a `/login`.",
        responses: { "302": redireccion("Redirección a /login") },
      },
    },
    "/health": {
      get: {
        tags: ["Sistema"],
        summary: "Salud del servicio",
        description: "Consulta `SELECT 1` a MySQL. Lo usa el healthcheck de Docker.",
        responses: {
          "200": { description: "El servicio y MySQL responden", content: { "application/json": { schema: { $ref: "#/components/schemas/Salud" }, example: { status: "ok" } } } },
          "503": { description: "MySQL no responde", content: { "application/json": { schema: { $ref: "#/components/schemas/Salud" }, example: { status: "db-down" } } } },
        },
      },
    },
    "/Metadata": {
      get: {
        tags: ["Sistema"],
        summary: "Metadatos SAML del proveedor de servicio",
        description: "XML con el EntityID, el certificado y las URL de callback. Es lo que se entrega a sistemas@ucol.mx para registrar la aplicación.",
        responses: { "200": { description: "XML de metadatos SAML", content: { "application/xml": { schema: { type: "string" } } } } },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "connect.sid",
        description: "Cookie de sesión que se obtiene al iniciar sesión con la cuenta institucional (flujo SAML, `/login`).",
      },
    },
    schemas: {
      CuerpoRespuesta: {
        type: "object",
        required: ["respuestas", "tiempoMin", "planetas"],
        properties: {
          respuestas: { $ref: "#/components/schemas/Respuestas" },
          tiempoMin: { type: "integer", minimum: 0, maximum: 1440, description: "Minutos que tardó el participante (se calcula en el navegador)." },
          planetas: { type: "string", enum: [...PLANETAS], description: "Planetas equivalentes que mostró la calculadora." },
        },
      },
      Respuestas: {
        type: "object",
        description:
          'Respuestas por id de pregunta (las claves son los ids del cuestionario, ver frontend/src/config/experiment.js). Los números pueden enviarse como número o como texto numérico ("21").',
        required: [
          "1", "S1", "2", "3", "4", "5",
          "9", "10", "11", "12", "13", "14", "15", "16", "17", "18",
          "19", "20", "21", "22", "23", "24",
        ],
        properties: {
          "1": { type: "integer", minimum: 15, maximum: 99, description: "Edad" },
          S1: { type: "string", enum: [...SEXO], description: "Sexo" },
          "2": { type: "string", enum: [...CARRERA], description: "Carrera" },
          "3": { type: "string", enum: [...SEMESTRE], description: "Semestre" },
          "4": { type: "string", enum: [...SI_NO], description: "¿Conocía una calculadora de huella ecológica antes?" },
          "5": { type: "string", enum: [...SI_NO], description: "¿Completó el cálculo?" },
          "8": textoAbierto("Pregunta que no supo responder"),
          "9": likert("Usabilidad: me gustaría usar la calculadora con frecuencia"),
          "10": likert("Usabilidad: la encontré innecesariamente compleja"),
          "11": likert("Usabilidad: pensé que era fácil de usar"),
          "12": likert("Usabilidad: necesitaría apoyo de una persona técnica"),
          "13": likert("Usabilidad: las funciones estaban bien integradas"),
          "14": likert("Usabilidad: había demasiadas inconsistencias"),
          "15": likert("Usabilidad: la mayoría aprendería a usarla muy rápido"),
          "16": likert("Usabilidad: la encontré muy incómoda de usar"),
          "17": likert("Usabilidad: me sentí con mucha confianza al usarla"),
          "18": likert("Usabilidad: necesité aprender muchas cosas antes de empezar"),
          "19": likert("Conciencia: tenía una idea clara de cómo mis hábitos afectan al medio ambiente"),
          "20": likert("Conciencia: el resultado coincidió con lo que esperaba"),
          "21": likert("Conciencia: identifiqué un hábito que impacta más de lo que pensaba"),
          "22": likert("Conciencia: entiendo qué acciones de mi día a día pesan más"),
          "23": likert("Intención: tengo intención de modificar un hábito en los próximos 30 días"),
          "24": likert("Intención: las recomendaciones me parecen aplicables a mi vida"),
          "25": textoAbierto("Hábito que le gustaría cambiar"),
          "26": textoAbierto("Lo que más le costó de la calculadora o qué cambiaría"),
          "27": textoAbierto("Comentario adicional"),
        },
      },
      ExitoRespuesta: {
        type: "object",
        required: ["success"],
        properties: { success: { type: "boolean", const: true } },
      },
      ErrorRespuesta: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: { type: "boolean", const: false },
          error: { type: "string", enum: ["invalido", "sin-sesion", "no-permitido", "duplicado", "error-interno"] },
          detalle: { type: "array", items: { type: "string" }, description: "Solo con `invalido`: un mensaje por cada campo con error." },
        },
      },
      EstadoSesion: {
        type: "object",
        required: ["authenticated", "permitido", "participante"],
        properties: {
          authenticated: { type: "boolean", description: "Hay una sesión SAML iniciada." },
          permitido: { type: "boolean", description: "La cuenta es de un estudiante y puede participar." },
          participante: { oneOf: [{ $ref: "#/components/schemas/ParticipantePublico" }, { type: "null" }] },
        },
      },
      ParticipantePublico: {
        type: "object",
        required: ["id", "tipo"],
        description: "Lo único que el navegador conoce del participante: nunca el correo, el nombre ni la cuenta.",
        properties: {
          id: { type: "string", description: "Identificador pseudónimo (16 caracteres hexadecimales derivados de la cuenta con una sal secreta)." },
          tipo: { type: ["string", "null"], description: "Tipo de cuenta que informa el IdP (por ejemplo `Estudiante`)." },
        },
      },
      Salud: {
        type: "object",
        required: ["status"],
        properties: { status: { type: "string", enum: ["ok", "db-down"] } },
      },
    },
  },
} as const;

export type Especificacion = typeof especificacion;
