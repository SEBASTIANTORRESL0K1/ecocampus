// Configuración del experimento
// Cambia EXPERIMENTO_ACTIVO a true para habilitar el cuestionario extendido

export const EXPERIMENTO_ACTIVO = true;

// URL del backend de login federado (UCOL). Si no esta definida, no se pide login.
export const AUTH_URL = import.meta.env.VITE_AUTH_URL || "";
export const LOGIN_REQUERIDO = EXPERIMENTO_ACTIVO && Boolean(AUTH_URL);

export const cuestionarioExperimento = {
  titulo: "Cuestionario de evaluación: Eco-Campus",
  subtitulo: "Calculadora de huella ecológica del Campus Central, Universidad de Colima",
  secciones: [
    {
      id: "consentimiento",
      titulo: "Consentimiento informado",
      instrucciones_aplicador: "Lee al participante antes de empezar.",
      texto: "Estás invitado/a a participar en una evaluación de la calculadora de huella ecológica Eco-Campus, desarrollada como parte de un proyecto de tesis en la Universidad de Colima. Consiste en usar la calculadora durante unos minutos y responder un cuestionario breve. Tus respuestas son confidenciales y se usarán solo con fines académicos: se guardará tu correo institucional junto con ellas, pero no se publicará ni se compartirá. No hay respuestas correctas o incorrectas, y puedes dejar de participar en cualquier momento.",
      preguntas: [
        {
          id: "C1",
          texto: "¿Aceptas participar?",
          tipo: "opcion_unica",
          opciones: ["Sí, acepto", "No, gracias"]
        }
      ]
    },
    {
      id: "datos_generales",
      titulo: "Parte 1. Datos generales",
      instrucciones: "Confidenciales, solo con fines estadísticos.",
      preguntas: [
        {
          id: "1",
          texto: "¿Cuál es tu edad?",
          tipo: "texto_corto"
        },
        {
          id: "S1",
          texto: "¿Cuál es tu sexo?",
          tipo: "select",
          opciones: ["Femenino", "Masculino", "Prefiero no decirlo"]
        },
        {
          id: "2",
          texto: "¿Cuál es tu carrera o área?",
          tipo: "select",
          opciones: [
            "Ingeniería en Software",
            "Ingeniería en Tecnologías de la Información",
            "Docente",
            "Personal Administrativo"
          ]
        },
        {
          id: "3",
          texto: "¿En qué semestre o nivel vas?",
          tipo: "select",
          opciones: [
            "1",
            "3",
            "5",
            "7",
            "No aplica"
          ]
        },
        {
          id: "4",
          texto: "¿Conocías alguna calculadora de huella ecológica antes de hoy?",
          tipo: "opcion_unica",
          opciones: ["Sí", "No"]
        }
      ]
    },
    {
      id: "tarea",
      titulo: "Parte 2. Tarea",
      instrucciones: "Pide al participante que use la calculadora de Eco-Campus para calcular su huella y que regrese a responder.",
      preguntas: [
        {
          id: "5",
          texto: "¿Completaste el cálculo?",
          tipo: "opcion_unica",
          opciones: ["Sí", "No"]
        },
        {
          id: "8",
          texto: "¿Hubo alguna pregunta que no supiste cómo responder? Si la hubo, dime cuál.",
          tipo: "texto_largo",
          opcional: true
        }
      ]
    },
    {
      id: "usabilidad",
      titulo: "Parte 3. Usabilidad",
      instrucciones: "Responde según tu experiencia con la calculadora.",
      escala: {
        min: 1,
        max: 5,
        etiquetas: {
          "1": "Totalmente en desacuerdo",
          "5": "Totalmente de acuerdo"
        }
      },
      preguntas: [
        {"id": "9", "texto": "Creo que me gustaría usar esta calculadora con frecuencia.", "tipo": "escala_likert"},
        {"id": "10", "texto": "Encontré la calculadora innecesariamente compleja.", "tipo": "escala_likert"},
        {"id": "11", "texto": "Pensé que la calculadora era fácil de usar.", "tipo": "escala_likert"},
        {"id": "12", "texto": "Creo que necesitaría apoyo de una persona técnica para usarla.", "tipo": "escala_likert"},
        {"id": "13", "texto": "Las funciones de la calculadora estaban bien integradas.", "tipo": "escala_likert"},
        {"id": "14", "texto": "Pensé que había demasiadas inconsistencias.", "tipo": "escala_likert"},
        {"id": "15", "texto": "Imagino que la mayoría de las personas aprendería a usarla muy rápido.", "tipo": "escala_likert"},
        {"id": "16", "texto": "La encontré muy incómoda de usar.", "tipo": "escala_likert"},
        {"id": "17", "texto": "Me sentí con mucha confianza al usarla.", "tipo": "escala_likert"},
        {"id": "18", "texto": "Necesité aprender muchas cosas antes de poder empezar.", "tipo": "escala_likert"}
      ]
    },
    {
      id: "conciencia",
      titulo: "Parte 4. Conciencia percibida",
      escala: {
        min: 1,
        max: 5,
        etiquetas: {
          "1": "Totalmente en desacuerdo",
          "5": "Totalmente de acuerdo"
        }
      },
      preguntas: [
        {"id": "19", "texto": "Antes de usar la calculadora, tenía una idea clara de cómo mis hábitos afectan al medio ambiente.", "tipo": "escala_likert"},
        {"id": "20", "texto": "El resultado coincidió con lo que yo esperaba.", "tipo": "escala_likert"},
        {"id": "21", "texto": "Identifiqué al menos un hábito que impacta más de lo que pensaba.", "tipo": "escala_likert"},
        {"id": "22", "texto": "Ahora entiendo qué acciones de mi día a día pesan más en mi huella.", "tipo": "escala_likert"}
      ]
    },
    {
      id: "intencion",
      titulo: "Parte 5. Intención y utilidad",
      escala: {
        min: 1,
        max: 5,
        etiquetas: {
          "1": "Totalmente en desacuerdo",
          "5": "Totalmente de acuerdo"
        }
      },
      preguntas: [
        {"id": "23", "texto": "Tengo intención de modificar al menos un hábito en los próximos 30 días.", "tipo": "escala_likert"},
        {"id": "24", "texto": "Las recomendaciones de la calculadora me parecen aplicables a mi vida.", "tipo": "escala_likert"}
      ]
    },
    {
      id: "abiertas",
      titulo: "Parte 6. Preguntas abiertas",
      instrucciones: "Opcionales.",
      preguntas: [
        {"id": "25", "texto": "¿Qué hábito te gustaría cambiar, si alguno?", "tipo": "texto_largo", "opcional": true},
        {"id": "26", "texto": "¿Qué es lo que más te costó de la calculadora o qué cambiarías?", "tipo": "texto_largo", "opcional": true},
        {"id": "27", "texto": "¿Tienes algún comentario adicional?", "tipo": "texto_largo", "opcional": true}
      ]
    }
  ]
};
