/**
 * E2E tests for the Huella Ecologica calculator flow.
 *
 * The app is served by Vite under the /ecocampus/ base path, so all
 * navigation targets are relative to baseURL = 'http://localhost:5173/ecocampus'.
 *
 * Total steps: 31
 *   - 15 Alimentos (Q1-Q15)
 *   - 5  Transporte (Q16-Q20)
 *   - 1  habitantesHogar (paso especial, inserted before Q21)
 *   - 9  Energia (Q21-Q29)
 *   - 1  Forestal (Q30)
 *
 * Infrastructure (6,400 pts) is always added to the total; it is not a step.
 */

import { test, expect } from '@playwright/test';

// Wait for React to mount before asserting — Vite compiles on first request so
// the initial cold-start can exceed the default assertion timeout.
test.beforeEach(async ({ page }) => {
  await page.waitForLoadState('networkidle');
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Clicks the "Siguiente" button and waits until the progress counter changes
 * to the expected step number (1-based).
 *
 * @param {import('@playwright/test').Page} page
 * @param {number} expectedStep - the step number that should appear AFTER clicking
 */
async function clickSiguiente(page, expectedStep) {
  await page.getByRole('button', { name: 'Siguiente' }).click();
  if (expectedStep <= 31) {
    await expect(
      page.getByText(new RegExp(`Pregunta ${expectedStep} de 31`))
    ).toBeVisible();
  }
}

/**
 * Clicks the "Finalizar" button (shown on the last step) and waits for the
 * results screen to appear.
 */
async function clickFinalizar(page) {
  await page.getByRole('button', { name: 'Finalizar' }).click();
  await expect(page.getByText('Tu resultado')).toBeVisible();
}

/**
 * Advances through all Alimentos steps (Q1-Q15) choosing the FIRST option of
 * every unica question and leaving multipleCantidad (Q11) inputs at 0.
 *
 * @param {import('@playwright/test').Page} page
 * @param {'first'|'last'} pick - which option to choose for unica questions
 */
async function answerAlimentos(page, pick) {
  // Q1 – Q10: all unica, select first or last option
  for (let step = 1; step <= 10; step++) {
    const buttons = page.locator('div.space-y-3 > button');
    if (pick === 'first') {
      await buttons.first().click();
    } else {
      await buttons.last().click();
    }
    await clickSiguiente(page, step + 1);
  }

  // Q11 – multipleCantidad: inputs default to 0 for min; set 10 each for max
  if (pick === 'last') {
    const inputs = page.locator('input[type="number"]');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      await inputs.nth(i).fill('10');
    }
  }
  await clickSiguiente(page, 12);

  // Q12 – Q15: unica
  for (let step = 12; step <= 15; step++) {
    const buttons = page.locator('div.space-y-3 > button');
    if (pick === 'first') {
      await buttons.first().click();
    } else {
      await buttons.last().click();
    }
    await clickSiguiente(page, step + 1);
  }
}

/**
 * Advances through all Transporte steps (Q16-Q20), step counter starts at 16.
 */
async function answerTransporte(page, pick) {
  for (let step = 16; step <= 20; step++) {
    const buttons = page.locator('div.space-y-3 > button');
    if (pick === 'first') {
      await buttons.first().click();
    } else {
      await buttons.last().click();
    }
    await clickSiguiente(page, step + 1);
  }
}

/**
 * Handles the habitantesHogar special step (step 21).
 * @param {import('@playwright/test').Page} page
 * @param {number} value
 */
async function answerHabitantesHogar(page, value) {
  const input = page.locator('input[type="number"]');
  await input.fill(String(value));
  await clickSiguiente(page, 22);
}

/**
 * Advances through Energia steps (Q21-Q29).
 *
 * Step mapping after habitantesHogar:
 *   step 22 -> Q21 multipleCheckbox
 *   step 23 -> Q22 unica
 *   step 24 -> Q23 unica
 *   step 25 -> Q24 cantidadDispositivo
 *   step 26 -> Q25 multiGrupo
 *   step 27 -> Q26 unica
 *   step 28 -> Q27 unica
 *   step 29 -> Q28 unica
 *   step 30 -> Q29 unica
 */
async function answerEnergia(page, pick) {
  // Q21 – multipleCheckbox (step 22): toggle all for max, none for min
  if (pick === 'last') {
    const buttons = page.locator('div.space-y-3 > button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      await buttons.nth(i).click();
    }
  }
  await clickSiguiente(page, 23);

  // Q22 unica (step 23)
  {
    const buttons = page.locator('div.space-y-3 > button');
    if (pick === 'first') {
      await buttons.first().click();
    } else {
      await buttons.last().click();
    }
    await clickSiguiente(page, 24);
  }

  // Q23 unica (step 24)
  {
    const buttons = page.locator('div.space-y-3 > button');
    if (pick === 'first') {
      await buttons.first().click();
    } else {
      await buttons.last().click();
    }
    await clickSiguiente(page, 25);
  }

  // Q24 cantidadDispositivo (step 25): 0 for min, 5 for max
  {
    const input = page.locator('input[type="number"]');
    await input.fill(pick === 'first' ? '0' : '5');
    await clickSiguiente(page, 26);
  }

  // Q25 multiGrupo (step 26): leave at "No tengo" for min, pick last option for max
  if (pick === 'last') {
    const selects = page.locator('select');
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      const select = selects.nth(i);
      // Select the last available <option> for each device group
      const lastOptionValue = await select.evaluate((el) => {
        const opts = Array.from(el.options);
        return opts[opts.length - 1].value;
      });
      await select.selectOption(lastOptionValue);
    }
  }
  await clickSiguiente(page, 27);

  // Q26 unica (step 27): "Gas LP" is the first option and has the highest value (500)
  // For min we still click first (Gas LP = 300 or lower, but there are only 3 options
  // and the lowest is Electricidad at 300). For simplicity: first click for both,
  // but for 'last' click last.
  {
    const buttons = page.locator('div.space-y-3 > button');
    if (pick === 'first') {
      await buttons.first().click();
    } else {
      await buttons.first().click(); // Gas LP (500) is the highest
    }
    await clickSiguiente(page, 28);
  }

  // Q27 unica (step 28): "Mas de 20 minutos" (910) is first and highest
  {
    const buttons = page.locator('div.space-y-3 > button');
    if (pick === 'first') {
      await buttons.last().click();  // "Solo 5 minutos" (149) -> lowest
    } else {
      await buttons.first().click(); // "Mas de 20 minutos" (910) -> highest
    }
    await clickSiguiente(page, 29);
  }

  // Q28 unica (step 29)
  {
    const buttons = page.locator('div.space-y-3 > button');
    if (pick === 'first') {
      await buttons.last().click();  // "Utilizo un vaso" (1) -> lowest
    } else {
      await buttons.first().click(); // "Dejo correr el agua" (6) -> highest
    }
    await clickSiguiente(page, 30);
  }

  // Q29 unica (step 30)
  {
    const buttons = page.locator('div.space-y-3 > button');
    if (pick === 'first') {
      await buttons.first().click();
    } else {
      await buttons.last().click();
    }
    await clickSiguiente(page, 31);
  }
}

/**
 * Answers the single Forestal step (Q30, step 31) and either clicks Siguiente
 * or Finalizar depending on whether it is the last step (it is — step 32 is Q30).
 *
 * Step 31 in the progress bar corresponds to Q30 (the last question).
 * After answering Q30 the next action is "Finalizar".
 */
async function answerForestal(page, pick) {
  const buttons = page.locator('div.space-y-3 > button');
  if (pick === 'first') {
    await buttons.first().click();
  } else {
    await buttons.last().click();
  }
  await clickFinalizar(page);
}

// ---------------------------------------------------------------------------
// Test 1 – Basic navigation: verify step 1 renders correctly
// ---------------------------------------------------------------------------

test('Test 1 - Navegacion basica: primer paso visible con progreso y botones correctos', async ({ page }) => {
  await page.goto('/ecocampus/calculadora');

  // The first question heading should be visible
  await expect(
    page.getByText('¿Cuántas raciones de fruta consumes a la semana?')
  ).toBeVisible();

  // Progress text shows "Pregunta 1 de 31"
  await expect(page.getByText('Pregunta 1 de 31')).toBeVisible();

  // Section label "Sección A: Alimentos" is part of the progress line
  await expect(page.getByText(/Sección A: Alimentos/)).toBeVisible();

  // Progress bar element exists and has a width close to 3.125% (1/32)
  const progressBar = page.locator('div.h-full.bg-lime-500');
  await expect(progressBar).toBeVisible();
  const width = await progressBar.evaluate((el) => el.style.width);
  const numericWidth = parseFloat(width);
  expect(numericWidth).toBeGreaterThan(0);
  expect(numericWidth).toBeLessThanOrEqual(5); // ~3.125%

  // "Anterior" button is disabled on the first step
  const anteriorBtn = page.getByRole('button', { name: 'Anterior' });
  await expect(anteriorBtn).toBeDisabled();

  // "Siguiente" button is visible and enabled
  const siguienteBtn = page.getByRole('button', { name: 'Siguiente' });
  await expect(siguienteBtn).toBeVisible();
  await expect(siguienteBtn).toBeEnabled();
});

// ---------------------------------------------------------------------------
// Test 2 – Forward and backward navigation
// ---------------------------------------------------------------------------

test('Test 2 - Avanzar y retroceder entre pasos', async ({ page }) => {
  await page.goto('/ecocampus/calculadora');

  // Select any option in step 1 to ensure state is set
  await page.locator('div.space-y-3 > button').first().click();

  // Advance to step 2
  await clickSiguiente(page, 2);
  await expect(page.getByText('Pregunta 2 de 31')).toBeVisible();

  // "Anterior" must be enabled now
  await expect(page.getByRole('button', { name: 'Anterior' })).toBeEnabled();

  // Go back to step 1
  await page.getByRole('button', { name: 'Anterior' }).click();
  await expect(page.getByText('Pregunta 1 de 31')).toBeVisible();

  // "Anterior" must be disabled again on step 1
  await expect(page.getByRole('button', { name: 'Anterior' })).toBeDisabled();
});

// ---------------------------------------------------------------------------
// Test 3 – Complete flow with minimum answers (resultado sustentable)
// ---------------------------------------------------------------------------

test('Test 3 - Flujo completo con respuestas minimas (resultado sustentable)', async ({ page }) => {
  await page.goto('/ecocampus/calculadora');

  await answerAlimentos(page, 'first');       // steps 1-15, ends at step 16
  await answerTransporte(page, 'first');      // steps 16-20, ends at step 21
  await answerHabitantesHogar(page, 1);      // step 21, ends at step 22
  await answerEnergia(page, 'first');         // steps 22-30, ends at step 31
  await answerForestal(page, 'first');        // step 31 + Finalizar

  // Results screen assertions
  await expect(page.getByText('Tu resultado')).toBeVisible();

  // The total score figure must be present (any number rendered inside the result card)
  await expect(page.getByText(/Tu huella ecológica total es de/)).toBeVisible();

  // "Volver al Inicio" link must be visible
  await expect(page.getByRole('link', { name: 'Volver al Inicio' })).toBeVisible();
});

// ---------------------------------------------------------------------------
// Test 4 – Complete flow with maximum answers (resultado insostenible)
// ---------------------------------------------------------------------------

test('Test 4 - Flujo completo con respuestas maximas (resultado insostenible)', async ({ page }) => {
  await page.goto('/ecocampus/calculadora');

  await answerAlimentos(page, 'last');        // steps 1-15, ends at step 16
  await answerTransporte(page, 'last');       // steps 16-20, ends at step 21
  await answerHabitantesHogar(page, 1);      // step 21 (1 habitante maximizes energy)
  await answerEnergia(page, 'last');          // steps 22-30, ends at step 31
  await answerForestal(page, 'last');         // step 31 + Finalizar

  // Results screen
  await expect(page.getByText('Tu resultado')).toBeVisible();

  // Extract the displayed total to assert it exceeds 32,000
  const scoreText = await page.getByText(/Tu huella ecológica total es de/).textContent();
  // The score is formatted with toLocaleString, e.g. "123,456" or "123.456"
  const digits = scoreText.replace(/[^0-9]/g, '');
  const score = parseInt(digits, 10);
  expect(score).toBeGreaterThan(32000);

  // The interpretation message must mention "insostenible" or "Huella Ecológica"
  const resultCard = page.locator('div.bg-white.p-12');
  await expect(
    resultCard.getByText(/insostenible|Huella Ecológica/i).first()
  ).toBeVisible();
});

// ---------------------------------------------------------------------------
// Test 5 – Q24 cantidadDispositivo input validation
// ---------------------------------------------------------------------------

test('Test 5 - Input de celulares (Q24) acepta valor 3 y permite continuar', async ({ page }) => {
  await page.goto('/ecocampus/calculadora');

  // Advance through Alimentos (steps 1-15)
  await answerAlimentos(page, 'first');

  // Advance through Transporte (steps 16-20)
  await answerTransporte(page, 'first');

  // habitantesHogar (step 21)
  await answerHabitantesHogar(page, 1);

  // Q21 multipleCheckbox (step 22) – skip selection
  await clickSiguiente(page, 23);

  // Q22 unica (step 23)
  await page.locator('div.space-y-3 > button').first().click();
  await clickSiguiente(page, 24);

  // Q23 unica (step 24)
  await page.locator('div.space-y-3 > button').first().click();
  await clickSiguiente(page, 25);

  // Now at Q24 cantidadDispositivo (step 25)
  await expect(page.getByText('¿Cuentas con teléfono celular propio?')).toBeVisible();

  const celularInput = page.locator('input[type="number"]');
  await celularInput.fill('3');
  await expect(celularInput).toHaveValue('3');

  // Advance to Q25 without error
  await clickSiguiente(page, 26);
  await expect(page.getByText('Pregunta 26 de 31')).toBeVisible();
});

// ---------------------------------------------------------------------------
// Test 6 – habitantesHogar special step
// ---------------------------------------------------------------------------

test('Test 6 - Paso habitantesHogar acepta valor 4 y avanza correctamente', async ({ page }) => {
  await page.goto('/ecocampus/calculadora');

  // Advance through Alimentos (steps 1-15)
  await answerAlimentos(page, 'first');

  // Advance through Transporte (steps 16-20)
  await answerTransporte(page, 'first');

  // Now at habitantesHogar (step 21)
  await expect(page.getByText('Pregunta 21 de 31')).toBeVisible();

  // The question text contains "cuántas personas viven en tu hogar"
  await expect(
    page.getByText(/cuántas personas viven en tu hogar/i)
  ).toBeVisible();

  // Change the value to 4
  const input = page.locator('input[type="number"]');
  await input.fill('4');
  await expect(input).toHaveValue('4');

  // Click Siguiente and verify we advance to step 22 (Q21 multipleCheckbox)
  await clickSiguiente(page, 22);
  await expect(page.getByText('Pregunta 22 de 31')).toBeVisible();
});
