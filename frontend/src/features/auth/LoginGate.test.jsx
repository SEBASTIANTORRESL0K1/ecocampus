import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginGate from "./LoginGate";

vi.mock("../../config/experiment", () => ({ API_URL: "http://api.test", LOGIN_REQUERIDO: true }));
vi.mock("../../components/layout/PageLayout", () => ({ default: ({ children }) => <main>{children}</main> }));

const json = (cuerpo, status = 200) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(cuerpo) });

function simularApi({ me, acceso }) {
  global.fetch = vi.fn((url) => {
    if (url.endsWith("/api/me")) return json(me);
    if (url.endsWith("/api/acceso/correo")) return acceso ? acceso() : json({ success: true });
    return Promise.reject(new Error(`ruta inesperada ${url}`));
  });
}

const renderizar = () => render(<LoginGate>contenido protegido</LoginGate>);

afterEach(() => vi.restoreAllMocks());

describe("modo saml", () => {
  test("sin sesion ofrece el login con UCOL y no pide correo", async () => {
    simularApi({ me: { authenticated: false, permitido: false, modoAcceso: "saml", participante: null } });
    renderizar();
    expect(await screen.findByRole("link", { name: /iniciar sesión con ucol/i })).toHaveAttribute("href", "http://api.test/login");
    expect(screen.queryByLabelText(/correo institucional/i)).not.toBeInTheDocument();
  });

  test("una cuenta que no es de estudiante no puede participar", async () => {
    simularApi({ me: { authenticated: true, permitido: false, modoAcceso: "saml", participante: null } });
    renderizar();
    expect(await screen.findByText(/solo para estudiantes/i)).toBeInTheDocument();
  });

  test("con sesion permitida muestra el contenido", async () => {
    simularApi({ me: { authenticated: true, permitido: true, modoAcceso: "saml", participante: { id: "x", tipo: "Estudiante" } } });
    renderizar();
    expect(await screen.findByText("contenido protegido")).toBeInTheDocument();
  });
});

describe("modo correo", () => {
  const sinSesion = { authenticated: false, permitido: false, modoAcceso: "correo", participante: null };

  async function aceptarPrivacidad() {
    await userEvent.click(await screen.findByRole("checkbox", { name: /he leído el aviso/i }));
  }

  test("sin sesion pide el correo y no ofrece el login con UCOL", async () => {
    simularApi({ me: sinSesion });
    renderizar();
    expect(await screen.findByLabelText(/correo institucional/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /iniciar sesión con ucol/i })).not.toBeInTheDocument();
  });

  test("el correo y el boton estan deshabilitados sin aceptar el aviso de privacidad", async () => {
    simularApi({ me: sinSesion });
    renderizar();
    expect(await screen.findByLabelText(/correo institucional/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /continuar/i })).toBeDisabled();
  });

  test("al enviar un correo valido envia la peticion con cookies y muestra el contenido", async () => {
    simularApi({ me: sinSesion });
    renderizar();
    await aceptarPrivacidad();
    await userEvent.type(await screen.findByLabelText(/correo institucional/i), "alumno@ucol.mx");
    await userEvent.click(screen.getByRole("button", { name: /continuar/i }));
    expect(await screen.findByText("contenido protegido")).toBeInTheDocument();
    const llamada = global.fetch.mock.calls.find(([url]) => url.endsWith("/api/acceso/correo"));
    expect(llamada[1]).toMatchObject({ method: "POST", credentials: "include", body: JSON.stringify({ correo: "alumno@ucol.mx" }) });
  });

  test("un dominio no permitido muestra el error y no deja pasar", async () => {
    simularApi({ me: sinSesion, acceso: () => json({ success: false, error: "dominio-no-permitido", dominios: ["ucol.mx"] }, 403) });
    renderizar();
    await aceptarPrivacidad();
    await userEvent.type(await screen.findByLabelText(/correo institucional/i), "alguien@gmail.com");
    await userEvent.click(screen.getByRole("button", { name: /continuar/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("@ucol.mx");
    expect(screen.queryByText("contenido protegido")).not.toBeInTheDocument();
  });

  test("un correo invalido muestra el error", async () => {
    simularApi({ me: sinSesion, acceso: () => json({ success: false, error: "correo-invalido" }, 400) });
    renderizar();
    await aceptarPrivacidad();
    await userEvent.type(await screen.findByLabelText(/correo institucional/i), "x");
    await userEvent.click(screen.getByRole("button", { name: /continuar/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/correo válido/i);
  });

  test("el boton esta deshabilitado mientras no haya texto aunque se acepte la privacidad", async () => {
    simularApi({ me: sinSesion });
    renderizar();
    await aceptarPrivacidad();
    expect(screen.getByRole("button", { name: /continuar/i })).toBeDisabled();
  });

  test("con sesion de correo ya abierta muestra el contenido", async () => {
    simularApi({ me: { authenticated: true, permitido: true, modoAcceso: "correo", participante: { id: "x", tipo: null } } });
    renderizar();
    await waitFor(() => expect(screen.getByText("contenido protegido")).toBeInTheDocument());
  });
});

test("si el backend no responde ofrece reintentar", async () => {
  global.fetch = vi.fn(() => Promise.reject(new Error("red")));
  renderizar();
  expect(await screen.findByRole("button", { name: /reintentar/i })).toBeInTheDocument();
});
