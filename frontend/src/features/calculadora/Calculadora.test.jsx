import {
	render,
	screen,
	fireEvent,
	act,
	createEvent,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Calculadora from "./Calculadora";
import { pasoRespondido } from "./pasoRespondido";
import { CLAVE_PROGRESO } from "./progresoGuardado";

vi.mock('../../hooks/useScrollReveal', () => ({
	default: () => ({ ref: { current: null }, isVisible: true }),
}));

const renderCalculadora = () =>
	render(
		<MemoryRouter>
			<Calculadora />
		</MemoryRouter>,
	);

const leerGuardado = () => JSON.parse(localStorage.getItem(CLAVE_PROGRESO));

beforeEach(() => {
	localStorage.clear();
});

describe("Calculadora", () => {
	test("renderiza sin errores", () => {
		expect(() => renderCalculadora()).not.toThrow();
	});

	test("Siguiente esta deshabilitado hasta seleccionar una opcion", () => {
		renderCalculadora();
		const siguiente = screen.getByRole("button", { name: "Siguiente" });
		expect(siguiente).toBeDisabled();
		expect(
			screen.getByText("Selecciona una opción para continuar."),
		).toBeInTheDocument();

		fireEvent.click(
			screen.getByRole("button", { name: "1 a 2 raciones a la semana" }),
		);

		expect(siguiente).toBeEnabled();
		expect(
			screen.queryByText("Selecciona una opción para continuar."),
		).not.toBeInTheDocument();
	});

	test("la opcion nula (valor 0) habilita Siguiente", () => {
		renderCalculadora();
		// Paso 1 -> paso 2 -> paso 3 (pan), que tiene la opcion nula agregada
		fireEvent.click(
			screen.getByRole("button", { name: "1 a 2 raciones a la semana" }),
		);
		fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
		fireEvent.click(
			screen.getByRole("button", { name: "1 a 2 raciones a la semana" }),
		);
		fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

		expect(screen.getByText(/Pregunta 3 de 31/)).toBeInTheDocument();
		const siguiente = screen.getByRole("button", { name: "Siguiente" });
		expect(siguiente).toBeDisabled();

		fireEvent.click(screen.getByRole("button", { name: "No consumo pan" }));
		expect(siguiente).toBeEnabled();
	});

	test("muestra la imagen ilustrativa del tema con src y alt esperados", () => {
		renderCalculadora();
		const imagen = screen.getByRole("img", {
			name: "Imagen ilustrativa: ¿Cuántas raciones de fruta consumes a la semana?",
		});
		expect(imagen).toHaveAttribute("src", "/ecocampus/img/q1.webp");
		expect(imagen).toHaveAttribute("loading", "lazy");
	});

	test("muestra el respaldo si la imagen no carga", () => {
		renderCalculadora();
		const imagen = screen.getByRole("img", { name: /Imagen ilustrativa/ });
		fireEvent.error(imagen);

		expect(
			screen.queryByRole("img", { name: /Imagen ilustrativa/ }),
		).not.toBeInTheDocument();
		expect(screen.getByText("Imagen no disponible")).toBeInTheDocument();
	});
});

describe("Calculadora - persistencia en localStorage", () => {
	// Responde la pregunta 1 y avanza a la pregunta 2.
	const responderPrimeraPregunta = () => {
		fireEvent.click(
			screen.getByRole("button", { name: "1 a 2 raciones a la semana" }),
		);
		fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
	};

	test("sin respuestas no muestra aviso ni boton de borrar", () => {
		renderCalculadora();
		expect(
			screen.queryByText("Recuperamos tus respuestas guardadas."),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Borrar respuestas" }),
		).not.toBeInTheDocument();
		expect(localStorage.getItem(CLAVE_PROGRESO)).toBeNull();
	});

	test("las respuestas sobreviven a desmontar y volver a montar", () => {
		const { unmount } = renderCalculadora();
		responderPrimeraPregunta();
		fireEvent.click(
			screen.getByRole("button", { name: "2 a 4 raciones a la semana" }),
		);

		expect(leerGuardado()).toMatchObject({
			version: 1,
			pasoActual: 1,
			verResultado: false,
		});
		unmount();

		renderCalculadora();
		expect(screen.getByText(/Pregunta 2 de 31/)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "2 a 4 raciones a la semana" }),
		).toHaveClass("bg-[#4a7c59]");
		expect(screen.getByRole("button", { name: "Siguiente" })).toBeEnabled();

		fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
		expect(
			screen.getByRole("button", { name: "1 a 2 raciones a la semana" }),
		).toHaveClass("bg-[#4a7c59]");
	});

	// Guarda progreso en la pregunta 2 y vuelve a montar la calculadora.
	const montarConProgreso = () => {
		const { unmount } = renderCalculadora();
		responderPrimeraPregunta();
		unmount();
		renderCalculadora();
	};

	describe("toast de progreso recuperado", () => {
		afterEach(() => {
			vi.useRealTimers();
		});

		test("aparece como status con aria-live y se cierra solo tras 5 s", () => {
			vi.useFakeTimers();
			montarConProgreso();

			const toast = screen.getByRole("status");
			expect(toast).toHaveTextContent("Recuperamos tus respuestas guardadas.");
			expect(toast).toHaveAttribute("aria-live", "polite");

			act(() => vi.advanceTimersByTime(4000));
			expect(
				screen.getByText("Recuperamos tus respuestas guardadas."),
			).toBeInTheDocument();

			// 5 s visible y luego 300 ms de transicion de salida
			act(() => vi.advanceTimersByTime(1000));
			act(() => vi.advanceTimersByTime(300));
			expect(
				screen.queryByText("Recuperamos tus respuestas guardadas."),
			).not.toBeInTheDocument();
			// Cerrar el aviso no borra nada
			expect(leerGuardado()).not.toBeNull();
		});

		// Contenedor flotante del toast (el role="status" esta en el mensaje interno).
		const contenedorToast = () => screen.getByRole("status").closest(".fixed");

		test("el temporizador se pausa con el cursor encima", () => {
			vi.useFakeTimers();
			montarConProgreso();

			fireEvent.mouseEnter(contenedorToast());
			act(() => vi.advanceTimersByTime(10000));
			expect(
				screen.getByText("Recuperamos tus respuestas guardadas."),
			).toBeInTheDocument();

			fireEvent.mouseLeave(contenedorToast());
			act(() => vi.advanceTimersByTime(5000));
			act(() => vi.advanceTimersByTime(300));
			expect(
				screen.queryByText("Recuperamos tus respuestas guardadas."),
			).not.toBeInTheDocument();
		});

		test("el temporizador se pausa mientras el foco esta dentro del toast", () => {
			vi.useFakeTimers();
			montarConProgreso();

			const cerrar = screen.getByRole("button", { name: "Cerrar aviso" });
			act(() => cerrar.focus());
			act(() => vi.advanceTimersByTime(10000));
			expect(
				screen.getByText("Recuperamos tus respuestas guardadas."),
			).toBeInTheDocument();

			act(() => cerrar.blur());
			act(() => vi.advanceTimersByTime(5000));
			act(() => vi.advanceTimersByTime(300));
			expect(
				screen.queryByText("Recuperamos tus respuestas guardadas."),
			).not.toBeInTheDocument();
		});

		test("el boton Cerrar aviso lo oculta", () => {
			vi.useFakeTimers();
			montarConProgreso();

			fireEvent.click(screen.getByRole("button", { name: "Cerrar aviso" }));
			act(() => vi.advanceTimersByTime(400));
			expect(screen.queryByRole("status")).not.toBeInTheDocument();
		});

		test("la accion del toast abre el modal y solo borra al confirmar", () => {
			montarConProgreso();

			fireEvent.click(
				screen.getByRole("button", {
					name: "Borrar respuestas y empezar de nuevo",
				}),
			);
			expect(
				screen.getByRole("dialog", { name: "¿Borrar tus respuestas?" }),
			).toBeInTheDocument();
			expect(leerGuardado()).not.toBeNull();

			fireEvent.click(
				screen.getByRole("button", { name: "Sí, borrar respuestas" }),
			);
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
			expect(
				screen.queryByText("Recuperamos tus respuestas guardadas."),
			).not.toBeInTheDocument();
			expect(screen.getByText(/Pregunta 1 de 31/)).toBeInTheDocument();
			expect(localStorage.getItem(CLAVE_PROGRESO)).toBeNull();
		});
	});

	describe("modal de confirmacion de Borrar respuestas", () => {
		// Escape en un <dialog> nativo dispara el evento `cancel` (jsdom no lo hace solo).
		const presionarEscape = (dialogo) => {
			fireEvent(
				dialogo,
				createEvent("cancel", dialogo, {}, { EventType: "Event" }),
			);
		};

		const abrirModal = () => {
			renderCalculadora();
			responderPrimeraPregunta();
			const disparador = screen.getByRole("button", {
				name: "Borrar respuestas",
			});
			disparador.focus();
			fireEvent.click(disparador);
			return disparador;
		};

		test("abre un dialog nativo accesible con el foco en Cancelar y bloquea el scroll", () => {
			abrirModal();
			const dialogo = screen.getByRole("dialog", {
				name: "¿Borrar tus respuestas?",
			});
			expect(dialogo.tagName).toBe("DIALOG");
			expect(dialogo).toHaveAttribute("open");
			expect(dialogo).toHaveAccessibleDescription(/pregunta 1/i);
			expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
			expect(document.body.style.overflow).toBe("hidden");
		});

		test("Cancelar cierra sin borrar y devuelve el foco al disparador", () => {
			const disparador = abrirModal();
			fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
			expect(disparador).toHaveFocus();
			expect(document.body.style.overflow).toBe("");
			expect(screen.getByText(/Pregunta 2 de 31/)).toBeInTheDocument();
			expect(leerGuardado()).not.toBeNull();
		});

		test("Escape y clic en el fondo cierran sin borrar", () => {
			const disparador = abrirModal();
			presionarEscape(screen.getByRole("dialog"));
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
			expect(disparador).toHaveFocus();

			// Un clic en el ::backdrop tiene como target el propio <dialog>
			fireEvent.click(disparador);
			fireEvent.click(screen.getByRole("dialog"));
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

			// Un clic dentro del contenido no cierra
			fireEvent.click(disparador);
			fireEvent.click(screen.getByText(/Se perderán todas las respuestas/));
			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(leerGuardado()).not.toBeNull();
		});

		test("Tab y Shift+Tab quedan atrapados dentro del dialogo", () => {
			abrirModal();
			const cancelar = screen.getByRole("button", { name: "Cancelar" });
			const confirmar = screen.getByRole("button", {
				name: "Sí, borrar respuestas",
			});

			confirmar.focus();
			fireEvent.keyDown(confirmar, { key: "Tab" });
			expect(cancelar).toHaveFocus();

			fireEvent.keyDown(cancelar, { key: "Tab", shiftKey: true });
			expect(confirmar).toHaveFocus();
		});

		test("Sí, borrar respuestas limpia el almacenamiento y vuelve a la pregunta 1", () => {
			abrirModal();
			fireEvent.click(
				screen.getByRole("button", { name: "Sí, borrar respuestas" }),
			);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
			expect(screen.getByText(/Pregunta 1 de 31/)).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
			expect(
				screen.getByRole("button", { name: "1 a 2 raciones a la semana" }),
			).not.toHaveClass("bg-[#4a7c59]");
			expect(
				screen.queryByRole("button", { name: "Borrar respuestas" }),
			).not.toBeInTheDocument();
			expect(localStorage.getItem(CLAVE_PROGRESO)).toBeNull();
		});
	});

	test("JSON corrupto se ignora y empieza desde la pregunta 1", () => {
		localStorage.setItem(CLAVE_PROGRESO, "{corrupto");
		renderCalculadora();
		expect(screen.getByText(/Pregunta 1 de 31/)).toBeInTheDocument();
		expect(
			screen.queryByText("Recuperamos tus respuestas guardadas."),
		).not.toBeInTheDocument();
	});

	describe("pantalla de resultados restaurada", () => {
		beforeEach(() => {
			localStorage.setItem(
				CLAVE_PROGRESO,
				JSON.stringify({
					version: 1,
					respuestas: { 1: 27, 30: 0, habitantesHogar: 1 },
					pasoActual: 30,
					verResultado: true,
				}),
			);
		});

		test("recalcula el resultado a partir de las respuestas guardadas", () => {
			renderCalculadora();
			expect(
				screen.getByRole("heading", { name: "¡Tu resultado!" }),
			).toBeInTheDocument();
			// 27 (Q1) + 6,400 de infraestructura
			expect(screen.getByText((6427).toLocaleString())).toBeInTheDocument();
		});

		test("Contestar de nuevo borra el progreso y vuelve a la pregunta 1", () => {
			renderCalculadora();
			fireEvent.click(
				screen.getByRole("button", { name: "Contestar de nuevo" }),
			);

			expect(screen.getByText(/Pregunta 1 de 31/)).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
			expect(localStorage.getItem(CLAVE_PROGRESO)).toBeNull();
		});

		test("Revisar mis respuestas vuelve al ultimo paso conservando las respuestas", () => {
			renderCalculadora();
			fireEvent.click(
				screen.getByRole("button", { name: "Revisar mis respuestas" }),
			);

			expect(screen.getByText(/Pregunta 31 de 31/)).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "Finalizar" })).toBeEnabled();
			expect(leerGuardado()).toMatchObject({
				pasoActual: 30,
				verResultado: false,
			});
			expect(leerGuardado().respuestas).toMatchObject({ 1: 27 });
		});
	});
});

describe("Calculadora - paso habitantesHogar", () => {
	// Secciones A (Q1-Q15) y B (Q16-Q20) suman 20 pasos; habitantesHogar es el índice 20.
	const irAHabitantes = () => {
		localStorage.setItem(
			CLAVE_PROGRESO,
			JSON.stringify({
				version: 1,
				pasoActual: 20,
				respuestas: { 1: 27, habitantesHogar: 1 },
				verResultado: false,
			}),
		);
		renderCalculadora();
	};

	test("Siguiente esta habilitado sin necesidad de interaccion", () => {
		irAHabitantes();
		expect(screen.getByRole("button", { name: "Siguiente" })).toBeEnabled();
		expect(
			screen.queryByText("Selecciona una opción para continuar."),
		).not.toBeInTheDocument();
	});

	test("muestra la imagen ilustrativa del paso con src y alt esperados", () => {
		irAHabitantes();
		const imagen = screen.getByRole("img", {
			name: "Imagen ilustrativa: personas que viven en el hogar",
		});
		expect(imagen).toHaveAttribute("src", "/ecocampus/img/QFAM.webp");
		expect(imagen).toHaveAttribute("loading", "lazy");
	});

	test("limpiar el campo no resetea al valor 1 mientras se escribe", () => {
		irAHabitantes();
		const input = screen.getByRole("spinbutton");
		expect(input).toHaveValue(1);

		fireEvent.change(input, { target: { value: "" } });
		// Antes del fix el input volvía a 1 inmediatamente; ahora debe quedar vacío.
		expect(input).toHaveValue(null);
	});

	test("acepta un numero mayor que 1", () => {
		irAHabitantes();
		const input = screen.getByRole("spinbutton");

		fireEvent.change(input, { target: { value: "4" } });
		expect(input).toHaveValue(4);
	});

	test("al perder el foco con campo vacio corrige a 1", () => {
		irAHabitantes();
		const input = screen.getByRole("spinbutton");

		fireEvent.change(input, { target: { value: "" } });
		fireEvent.blur(input);
		expect(input).toHaveValue(1);
	});

	test("al perder el foco con valor por debajo de 1 corrige a 1", () => {
		irAHabitantes();
		const input = screen.getByRole("spinbutton");

		fireEvent.change(input, { target: { value: "0" } });
		fireEvent.blur(input);
		expect(input).toHaveValue(1);
	});
});

describe("pasoRespondido", () => {
	const pasoUnica = { tipo: "unica", pregunta: { id: 3 } };
	const pasoQ21 = { tipo: "multipleCheckbox", pregunta: { id: 21 } };

	test("unica: sin respuesta es falso y valor 0 es valido", () => {
		expect(pasoRespondido(pasoUnica, {})).toBe(false);
		expect(pasoRespondido(pasoUnica, { 3: 0 })).toBe(true);
		expect(pasoRespondido(pasoUnica, { 3: 27 })).toBe(true);
	});

	test('multipleCheckbox: requiere un electrodomestico o "Ninguno de estos"', () => {
		expect(pasoRespondido(pasoQ21, {})).toBe(false);
		expect(pasoRespondido(pasoQ21, { detalle21: [false, false] })).toBe(false);
		expect(pasoRespondido(pasoQ21, { detalle21: [false, true] })).toBe(true);
		expect(pasoRespondido(pasoQ21, { ninguno21: true, 21: 0 })).toBe(true);
	});

	test("pasos con valores por defecto cuentan como respondidos", () => {
		[
			"multipleCantidad",
			"cantidadDispositivo",
			"multiGrupo",
			"habitantesHogar",
		].forEach((tipo) => {
			expect(pasoRespondido({ tipo }, {})).toBe(true);
		});
	});
});
