// Configuracion del experimento (login UCOL, cuestionario y guardado en MySQL).

// El experimento es opt-in: solo se activa con VITE_EXPERIMENTO_ACTIVO=true. Sin la variable (por ejemplo,
// en el despliegue publico de GitHub Pages) la calculadora funciona normal, sin login ni cuestionario.
export const EXPERIMENTO_ACTIVO = import.meta.env.VITE_EXPERIMENTO_ACTIVO === "true";

// URL del backend (login federado UCOL y guardado de respuestas). Si no esta definida,
// no se pide login ni se envian respuestas.
export const API_URL = import.meta.env.VITE_API_URL || "";
export const LOGIN_REQUERIDO = EXPERIMENTO_ACTIVO && Boolean(API_URL);

const TYC = `Antes de finalizar, te pedimos unos minutos más para responder este último cuestionario, 
  el cual incluye algunos datos personales y tu retroalimentación sobre la experiencia de uso de la herramienta. 
  Queremos asegurarnos de que sepas que la información recabada, incluyendo tu correo institucional y tus respuestas,
  será utilizada exclusivamente con fines de investigación para este proyecto de tesis en la Universidad de Colima.
  Tus datos son totalmente seguros y no se publicarán ni se compartirán con terceros fuera del ámbito académico. 
  Recuerda que no hay respuestas correctas o incorrectas, y si en algún momento prefieres no continuar con el cuestionario final,
  puedes cerrarlo sin ningún problema. Al enviar tus respuestas,
  confirmas que estás de acuerdo con estos términos y das tu consentimiento para el uso académico de la información proporcionada.`
export const cuestionarioExperimento = {
  titulo: "Cuestionario de evaluación: Eco-Campus",
  subtitulo: "Calculadora de huella ecológica del Campus Central, Universidad de Colima",
  secciones: [
    {
      id: "consentimiento",
      titulo: "Consentimiento informado",
      instrucciones: "Gracias por utilizar la calculadora EcoCampus.",
      texto: TYC,
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
          tipo: "numero",
          min: 15,
          max: 99
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
            "Ingeniería en Tecnologías de la Información"
          ]
        },
        {
          id: "3",
          texto: "¿Cuál es el semestre en el que te encuentras?",
          tipo: "select",
          opciones: [
            "1",
            "3",
            "5",
            "7"
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
        { "id": "9", "texto": "Me gustaría usar esta calculadora con frecuencia.", "tipo": "escala_likert" },
        { "id": "10", "texto": "Encontré la calculadora innecesariamente compleja.", "tipo": "escala_likert" },
        { "id": "11", "texto": "Pensé que la calculadora era fácil de usar.", "tipo": "escala_likert" },
        { "id": "12", "texto": "Necesitaría apoyo de una persona técnica para usarla.", "tipo": "escala_likert" },
        { "id": "13", "texto": "Las funciones de la calculadora estaban bien integradas.", "tipo": "escala_likert" },
        { "id": "14", "texto": "Encontré demasiadas inconsistencias.", "tipo": "escala_likert" },
        { "id": "15", "texto": "Imagino que la mayoría de las personas aprendería a usarla muy rápido.", "tipo": "escala_likert" },
        { "id": "16", "texto": "La encontré muy incómoda de usar.", "tipo": "escala_likert" },
        { "id": "17", "texto": "Me sentí con mucha confianza al usarla.", "tipo": "escala_likert" },
        { "id": "18", "texto": "Necesité aprender muchas cosas antes de poder empezar.", "tipo": "escala_likert" }
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
        { "id": "19", "texto": "Antes de usar la calculadora, tenía una idea clara de cómo mis hábitos afectan al medio ambiente.", "tipo": "escala_likert" },
        { "id": "20", "texto": "El resultado coincidió con lo que yo esperaba.", "tipo": "escala_likert" },
        { "id": "21", "texto": "Identifiqué al menos un hábito que impacta más de lo que pensaba.", "tipo": "escala_likert" },
        { "id": "22", "texto": "Ahora entiendo qué acciones de mi día a día pesan más en mi huella.", "tipo": "escala_likert" }
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
        { "id": "23", "texto": "Tengo intención de modificar al menos un hábito en los próximos 30 días.", "tipo": "escala_likert" },
        { "id": "24", "texto": "Las recomendaciones de la calculadora me parecen aplicables a mi vida.", "tipo": "escala_likert" }
      ]
    },
    {
      id: "abiertas",
      titulo: "Parte 6. Preguntas abiertas",
      instrucciones: "Opcionales.",
      preguntas: [
        { "id": "25", "texto": "¿Qué hábito te gustaría cambiar, si alguno?", "tipo": "texto_largo", "opcional": true },
        { "id": "26", "texto": "¿Qué es lo que más te costó de la calculadora o qué cambiarías?", "tipo": "texto_largo", "opcional": true },
        { "id": "27", "texto": "¿Tienes algún comentario adicional?", "tipo": "texto_largo", "opcional": true }
      ]
    }
  ]
};
