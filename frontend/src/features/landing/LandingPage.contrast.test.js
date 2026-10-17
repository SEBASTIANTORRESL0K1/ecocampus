/**
 * Pruebas de contraste WCAG 2.1 (criterio 1.4.3) para los pares
 * color de texto / color de fondo definidos en LandingPage.jsx.
 *
 * Es una prueba puramente computacional: no renderiza componentes ni importa React.
 * Si cambian los colores del componente, actualizar las constantes de este archivo.
 *
 * Umbrales (WCAG 2.1 AA):
 *   - Texto normal: 4.5:1
 *   - Texto grande (>= 24px, o >= 18.66px en negrita): 3.0:1
 */

const UMBRAL_TEXTO_NORMAL = 4.5;
const UMBRAL_TEXTO_GRANDE = 3.0;

const BLANCO = '#ffffff';
const NEGRO = '#000000';

// Overlay del hero (LandingPage.jsx). La imagen de fondo es externa y de
// luminancia desconocida; se aproxima el fondo efectivo mezclando el overlay
// con negro al 65% de opacidad.
const HERO_OVERLAY = 'rgba(34,85,44,0.65)';

// ── Utilidades de color ─────────────────────────────────────────────────────

/**
 * Convierte un color hex (#rgb, #rrggbb) o rgba(r,g,b,a) en componentes numericos.
 */
function parseColor(color) {
  const str = color.trim().toLowerCase();

  if (str.startsWith('#')) {
    let hex = str.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    if (!/^[0-9a-f]{6}$/.test(hex)) {
      throw new Error(`Color hex invalido: ${color}`);
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: 1,
    };
  }

  const match = str.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/
  );
  if (!match) {
    throw new Error(`Color no soportado: ${color}`);
  }
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  };
}
/**
 * Aplica alpha compositing: el color con alpha se mezcla sobre un fondo opaco.
 * Devuelve un color opaco con canales redondeados a enteros (0-255).
 */
function compositeOver(fg, bg) {
  const mezcla = (f, b) => Math.round(fg.a * f + (1 - fg.a) * b);
  return {
    r: mezcla(fg.r, bg.r),
    g: mezcla(fg.g, bg.g),
    b: mezcla(fg.b, bg.b),
    a: 1,
  };
}

function toHex({ r, g, b }) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Linealizacion sRGB segun WCAG 2.1 (umbral 0.03928).
 */
function linearizarCanal(valor) {
  const s = valor / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Luminancia relativa segun WCAG 2.1.
 */
function luminanciaRelativa({ r, g, b }) {
  return (
    0.2126 * linearizarCanal(r) +
    0.7152 * linearizarCanal(g) +
    0.0722 * linearizarCanal(b)
  );
}

/**
 * Ratio de contraste WCAG 2.1: (L_clara + 0.05) / (L_oscura + 0.05).
 * Si un color tiene alpha < 1, se aproxima mezclandolo sobre blanco
 * (o sobre el fondo indicado en `backdrop`).
 */
function getContrastRatio(color1, color2, backdrop = BLANCO) {
  const fondo = parseColor(backdrop);
  const c1 = compositeOver(parseColor(color1), fondo);
  const c2 = compositeOver(parseColor(color2), fondo);

  const l1 = luminanciaRelativa(c1);
  const l2 = luminanciaRelativa(c2);
  const [clara, oscura] = l1 >= l2 ? [l1, l2] : [l2, l1];

  return (clara + 0.05) / (oscura + 0.05);
}

/**
 * Indica si un ratio cumple AA segun el tipo de texto.
 */
function meetsAA(ratio, isLargeText) {
  return ratio >= (isLargeText ? UMBRAL_TEXTO_GRANDE : UMBRAL_TEXTO_NORMAL);
}

/**
 * Afirma que un par fg/bg cumple AA. El mensaje incluye el ratio calculado.
 */
function expectAA(fg, bg, { grande = false, descripcion }) {
  const ratio = getContrastRatio(fg, bg);
  const minimo = grande ? UMBRAL_TEXTO_GRANDE : UMBRAL_TEXTO_NORMAL;
  expect(
    meetsAA(ratio, grande),
    `${descripcion}: ${fg} sobre ${bg} = ${ratio.toFixed(2)}:1 (minimo ${minimo}:1)`
  ).toBe(true);
}

// Fondo efectivo del hero: overlay rgba(34,85,44,0.65) mezclado sobre negro.
const HERO_BG = toHex(compositeOver(parseColor(HERO_OVERLAY), parseColor(NEGRO)));

// ── Verificacion de la formula ──────────────────────────────────────────────

describe('getContrastRatio — formula WCAG 2.1', () => {
  test('negro sobre blanco da el maximo 21:1', () => {
    expect(getContrastRatio(NEGRO, BLANCO)).toBeCloseTo(21, 5);
  });

  test('un color contra si mismo da 1:1', () => {
    expect(getContrastRatio('#4a7c59', '#4a7c59')).toBeCloseTo(1, 5);
  });

  test('el orden de los argumentos no altera el ratio', () => {
    expect(getContrastRatio('#1a2e1a', BLANCO)).toBeCloseTo(
      getContrastRatio(BLANCO, '#1a2e1a'),
      10
    );
  });

  test('acepta hex corto y rgba', () => {
    expect(getContrastRatio('#fff', '#000')).toBeCloseTo(21, 5);
    expect(getContrastRatio('rgba(0,0,0,1)', BLANCO)).toBeCloseTo(21, 5);
  });

  test('rgba semitransparente se aproxima mezclandolo sobre blanco', () => {
    // rgba(0,0,0,0.5) sobre blanco equivale a #808080 (128,128,128)
    expect(getContrastRatio('rgba(0,0,0,0.5)', BLANCO)).toBeCloseTo(
      getContrastRatio('#808080', BLANCO),
      5
    );
  });
});

describe('LandingPage — contraste WCAG AA', () => {
  describe('Hero', () => {
    test('fondo efectivo del hero calculado a partir del overlay', () => {
      expect(HERO_BG).toBe('#16371d');
    });

    test('H1 #ffffff sobre fondo del hero cumple AA (texto grande, 3.0:1)', () => {
      expectAA(BLANCO, HERO_BG, {
        grande: true,
        descripcion: 'H1 del hero (clamp minimo 35.2px, bold)',
      });
    });

    test('subtitulo italico #b8e0c8 sobre fondo del hero cumple AA (texto normal, 4.5:1)', () => {
      expectAA('#b8e0c8', HERO_BG, {
        descripcion: 'Subtitulo italico del hero (17.6px)',
      });
    });

    test('descripcion #d4ead9 sobre fondo del hero cumple AA (texto normal, 4.5:1)', () => {
      expectAA('#d4ead9', HERO_BG, {
        descripcion: 'Descripcion del hero (16px minimo)',
      });
    });

    test('boton #ffffff sobre #2d6a2d cumple AA (texto normal, 4.5:1)', () => {
      // 0.95rem con peso 600 no alcanza el tamano de texto grande.
      expectAA(BLANCO, '#2d6a2d', {
        descripcion: 'Boton "Comenzar calculo" (15.2px, semibold)',
      });
    });

    test('boton en hover #ffffff sobre #1e4d1e cumple AA (texto normal, 4.5:1)', () => {
      expectAA(BLANCO, '#1e4d1e', {
        descripcion: 'Boton "Comenzar calculo" en hover',
      });
    });
  });

  describe('Seccion About', () => {
    const FONDO = BLANCO;

    test('subtitulo italico #4a7c59 sobre #ffffff cumple AA (texto normal, 4.5:1)', () => {
      expectAA('#4a7c59', FONDO, {
        descripcion: 'Subtitulo "Bienvenido a EcoCampus" (16.8px)',
      });
    });

    test('H2 #1a2e1a sobre #ffffff cumple AA (texto grande, 3.0:1)', () => {
      expectAA('#1a2e1a', FONDO, {
        grande: true,
        descripcion: 'H2 "Que es la huella ecologica" (clamp minimo 25.6px, bold)',
      });
    });

    test('parrafos #3a4a3a sobre #ffffff cumplen AA (texto normal, 4.5:1)', () => {
      expectAA('#3a4a3a', FONDO, {
        descripcion: 'Parrafos de la seccion About (16px)',
      });
    });

    test('texto strong #2d6a2d sobre #ffffff cumple AA (texto normal, 4.5:1)', () => {
      expectAA('#2d6a2d', FONDO, {
        descripcion: 'Texto destacado en parrafo (strong, 16px)',
      });
    });

    test('numeros estadisticos #4a7c59 sobre #ffffff cumplen AA (texto grande, 3.0:1)', () => {
      expectAA('#4a7c59', FONDO, {
        grande: true,
        descripcion: 'Numeros estadisticos (32px, bold)',
      });
    });

    test('etiquetas de estadisticas #5a7a5a sobre #ffffff cumplen AA (texto normal, 4.5:1)', () => {
      expectAA('#5a7a5a', FONDO, {
        descripcion: 'Etiquetas de estadisticas (12.8px, uppercase)',
      });
    });
  });

  describe('Seccion Services', () => {
    const FONDO = '#f7f9f4';

    test('subtitulo italico #4a7c59 sobre #f7f9f4 cumple AA (texto normal, 4.5:1)', () => {
      expectAA('#4a7c59', FONDO, {
        descripcion: 'Subtitulo "Todo lo que necesitas" (16.8px)',
      });
    });

    test('H2 #1a2e1a sobre #f7f9f4 cumple AA (texto grande, 3.0:1)', () => {
      expectAA('#1a2e1a', FONDO, {
        grande: true,
        descripcion: 'H2 "Nuestras herramientas" (clamp minimo 25.6px, bold)',
      });
    });
  });

  describe('Tarjetas de herramientas', () => {
    const FONDO = BLANCO;

    test('H3 #1a2e1a sobre #ffffff cumple AA (16.8px, semibold: texto normal, 4.5:1)', () => {
      expectAA('#1a2e1a', FONDO, {
        descripcion: 'Nombre de la herramienta (H3, 1.05rem, 600)',
      });
    });

    test('descripcion #5a7a5a sobre #ffffff cumple AA (texto normal, 4.5:1)', () => {
      expectAA('#5a7a5a', FONDO, {
        descripcion: 'Descripcion de la herramienta (14.08px)',
      });
    });
  });
});
