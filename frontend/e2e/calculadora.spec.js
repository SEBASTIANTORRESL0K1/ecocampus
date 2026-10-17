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
 *
 * Selection is mandatory: "Siguiente"/"Finalizar" stays disabled until the
 * current step is answered. Most unica questions start with a null option
 * (valor 0, e.g. "No consumo pan"), so pick='first' selects it as the minimum.
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Vite compiles on first request so the cold-start can be slow.
// Always use this helper instead of page.goto directly.
async function gotoCalculadora(page) {
  await page.goto('/ecocampus/calculadora');
  await expect(page.getByText('Pregunta 1 de 31')).toBeVisible();
}

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
 * Advances through all Alimentos steps (Q1-Q15) choosing the first/last option of
 * every unica question and leaving multipleCantidad (Q11) inputs at 0 for 'first'.
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

  // Q11 – multipleCantidad: scoped selector avoids capturing unrelated number inputs
  await expect(page.getByText(/cuál de los siguientes alimentos/i)).toBeVisible();
  if (pick === 'last') {
    const inputs = page.locator('div.space-y-3 input[type="number"]');
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
 *
 * Q19 ("¿Cuentas con auto propio?"): first=last button ("No", 0) / last=first button ("Sí", 12000)
 * Q20 ("distancia en auto/taxi"):    first=first button ("No uso", 0) / last=last button ("25-30 km", 3500)
 * Q16-Q18: first=first button (null option, 0) / last=last button
 */
async function answerTransporte(page, pick) {
  for (let step = 16; step <= 20; step++) {
    const buttons = page.locator('div.space-y-3 > button');
    if (step === 19) {
      // "No" (0) minimiza; "Sí" (12000) maximiza — orden inverso al resto
      if (pick === 'first') { await buttons.last().click(); }
      else                  { await buttons.first().click(); }
    } else {
      if (pick === 'first') { await buttons.first().click(); }
      else                  { await buttons.last().click(); }
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
  // Q21 – multipleCheckbox (step 22): toggle every appliance for max,
  // "Ninguno de estos" for min (selection is mandatory). The "Ninguno" button
  // lives outside div.space-y-3, so the appliance loop never toggles it.
  if (pick === 'last') {
    const buttons = page.locator('div.space-y-3 > button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      await buttons.nth(i).click();
    }
  } else {
    await page.getByRole('button', { name: 'Ninguno de estos' }).click();
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

  // Q26 unica (step 27): "No tengo calentador / boiler"=0 (first), Gas LP=500,
  // Gas natural=400, Electricidad=300 (last). Highest is not at either end.
  {
    if (pick === 'first') {
      await page.getByRole('button', { name: 'No tengo calentador / boiler' }).click(); // 0 -> lowest
    } else {
      await page.getByRole('button', { name: 'Gas LP' }).click(); // 500 -> highest
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
// Suite
// ---------------------------------------------------------------------------

test.describe('Calculadora de Huella Ecologica', () => {

// Test 1 – Basic navigation: verify step 1 renders correctly
test('Test 1 - Navegacion basica: primer paso visible con progreso y botones correctos', async ({ page }) => {
  await gotoCalculadora(page);

  // The first question heading should be visible
  await expect(
    page.getByText('¿Cuántas raciones de fruta consumes a la semana?')
  ).toBeVisible();

  // Progress text shows "Pregunta 1 de 31"
  await expect(page.getByText('Pregunta 1 de 31')).toBeVisible();

  // Section label "Sección A: Alimentos" is part of the progress line
  await expect(page.getByText(/Sección A: Alimentos/)).toBeVisible();

  // Progress bar element exists and has a width close to 3.125% (1/32)
  const progressBar = page.locator('div.h-2 > div');
  await expect(progressBar).toBeVisible();
  const width = await progressBar.evaluate((el) => el.style.width);
  const numericWidth = parseFloat(width);
  expect(numericWidth).toBeGreaterThan(0);
  expect(numericWidth).toBeLessThanOrEqual(5); // ~3.125%

  // "Anterior" button is disabled on the first step
  const anteriorBtn = page.getByRole('button', { name: 'Anterior' });
  await expect(anteriorBtn).toBeDisabled();

  // "Siguiente" button is visible but disabled until an option is chosen
  const siguienteBtn = page.getByRole('button', { name: 'Siguiente' });
  await expect(siguienteBtn).toBeVisible();
  await expect(siguienteBtn).toBeDisabled();
});

// ---------------------------------------------------------------------------
// Test 2 – Forward and backward navigation
// ---------------------------------------------------------------------------

test('Test 2 - Avanzar y retroceder entre pasos', async ({ page }) => {
  await gotoCalculadora(page);

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
  await gotoCalculadora(page);

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
  await gotoCalculadora(page);

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
  const resultCard = page.locator('div.bg-white.max-w-2xl');
  await expect(
    resultCard.getByText(/insostenible|Huella Ecológica/i).first()
  ).toBeVisible();
});

// ---------------------------------------------------------------------------
// Test 5 – Q24 cantidadDispositivo input validation
// ---------------------------------------------------------------------------

test('Test 5 - Input de celulares (Q24) acepta valor 3 y permite continuar', async ({ page }) => {
  await gotoCalculadora(page);

  // Advance through Alimentos (steps 1-15)
  await answerAlimentos(page, 'first');

  // Advance through Transporte (steps 16-20)
  await answerTransporte(page, 'first');

  // habitantesHogar (step 21)
  await answerHabitantesHogar(page, 1);

  // Q21 multipleCheckbox (step 22) – selection is mandatory, choose "Ninguno de estos"
  await page.getByRole('button', { name: 'Ninguno de estos' }).click();
  await clickSiguiente(page, 23);

  // Q22 unica (step 23): null option
  await page.getByRole('button', { name: 'No hay focos convencionales en mi casa' }).click();
  await clickSiguiente(page, 24);

  // Q23 unica (step 24): null option
  await page.getByRole('button', { name: 'No hay focos ahorradores en mi casa' }).click();
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
  await gotoCalculadora(page);

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

// ---------------------------------------------------------------------------
// Test 7 – Mandatory selection and null option
// ---------------------------------------------------------------------------

test('Test 7 - Seleccion obligatoria y opcion nula', async ({ page }) => {
  await gotoCalculadora(page);

  const siguienteBtn = page.getByRole('button', { name: 'Siguiente' });

  // Step 1: disabled until an option is clicked
  await expect(siguienteBtn).toBeDisabled();
  await expect(page.getByText('Selecciona una opción para continuar.')).toBeVisible();
  await page.getByRole('button', { name: '1 a 2 raciones a la semana' }).click();
  await expect(siguienteBtn).toBeEnabled();
  await expect(page.getByText('Selecciona una opción para continuar.')).toBeHidden();
  await clickSiguiente(page, 2);

  await page.getByRole('button', { name: '1 a 2 raciones a la semana' }).click();
  await clickSiguiente(page, 3);

  // Step 3 (Q3, pan): the null option exists and counts as an answer
  await expect(siguienteBtn).toBeDisabled();
  const nula = page.getByRole('button', { name: 'No consumo pan' });
  await expect(nula).toBeVisible();
  await nula.click();
  await expect(siguienteBtn).toBeEnabled();
  await clickSiguiente(page, 4);
});

// ---------------------------------------------------------------------------
// Test 8 – Progress persists across reload (localStorage)
// ---------------------------------------------------------------------------

test('Test 8 - El progreso se conserva al recargar la pagina', async ({ page }) => {
  await gotoCalculadora(page);

  await page.getByRole('button', { name: '1 a 2 raciones a la semana' }).click();
  await clickSiguiente(page, 2);
  await page.getByRole('button', { name: '2 a 4 raciones a la semana' }).click();
  await clickSiguiente(page, 3);
  await page.getByRole('button', { name: 'No consumo pan' }).click();

  await page.reload();

  // Same step and same selection after reload, with the restored notice
  await expect(page.getByText('Pregunta 3 de 31')).toBeVisible();
  await expect(page.getByText('Recuperamos tus respuestas guardadas.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'No consumo pan' })).toHaveClass(/bg-\[#4a7c59\]/);
  await expect(page.getByRole('button', { name: 'Siguiente' })).toBeEnabled();

  // Previous answers are also restored
  await page.getByRole('button', { name: 'Anterior' }).click();
  await expect(page.getByText('Pregunta 2 de 31')).toBeVisible();
  await expect(page.getByRole('button', { name: '2 a 4 raciones a la semana' })).toHaveClass(/bg-\[#4a7c59\]/);

  // The toast sits in the top-right corner, below the navbar (does not cover it)
  const toast = page.getByRole('status').filter({ hasText: 'Recuperamos tus respuestas guardadas.' });
  const navBox = await page.locator('nav').boundingBox();
  const toastBox = await toast.boundingBox();
  const viewport = page.viewportSize();
  expect(toastBox.y).toBeGreaterThanOrEqual(navBox.y + navBox.height);
  expect(toastBox.x + toastBox.width / 2).toBeGreaterThan(viewport.width / 2);

  // The restored-progress toast auto-dismisses after ~5 s (plus exit transition)
  await expect(toast).toBeHidden({ timeout: 8000 });
});

// ---------------------------------------------------------------------------
// Test 9 – Clear saved progress from the questionnaire
// ---------------------------------------------------------------------------

test('Test 9 - Borrar respuestas pide confirmacion en un modal y reinicia el cuestionario', async ({ page }) => {
  await gotoCalculadora(page);

  await page.getByRole('button', { name: '1 a 2 raciones a la semana' }).click();
  await clickSiguiente(page, 2);

  // exact avoids matching the toast action "Borrar respuestas y empezar de nuevo"
  const borrar = page.getByRole('button', { name: 'Borrar respuestas', exact: true });
  const dialogo = page.getByRole('dialog', { name: '¿Borrar tus respuestas?' });

  // Escape closes the modal without clearing and returns focus to the trigger
  await borrar.click();
  await expect(dialogo).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancelar' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialogo).toBeHidden();
  await expect(borrar).toBeFocused();
  await expect(page.getByText('Pregunta 2 de 31')).toBeVisible();

  // Clicking the ::backdrop (outside the dialog box) closes it without clearing
  await borrar.click();
  await expect(dialogo).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialogo).toBeHidden();
  await expect(page.getByText('Pregunta 2 de 31')).toBeVisible();

  // Cancel keeps the progress
  await borrar.click();
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(dialogo).toBeHidden();
  let guardado = await page.evaluate(() => localStorage.getItem('ecocampus:calculadora:v1'));
  expect(guardado).not.toBeNull();

  // Confirm clears storage and goes back to step 1
  await borrar.click();
  await page.getByRole('button', { name: 'Sí, borrar respuestas' }).click();
  await expect(dialogo).toBeHidden();
  await expect(page.getByText('Pregunta 1 de 31')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
  guardado = await page.evaluate(() => localStorage.getItem('ecocampus:calculadora:v1'));
  expect(guardado).toBeNull();

  // After a reload nothing is restored
  await page.reload();
  await expect(page.getByText('Pregunta 1 de 31')).toBeVisible();
  await expect(page.getByText('Recuperamos tus respuestas guardadas.')).toBeHidden();
});

// ---------------------------------------------------------------------------
// Test 10 – Results survive reload, then "Contestar de nuevo"
// ---------------------------------------------------------------------------

test('Test 10 - Resultado restaurado tras recargar y Contestar de nuevo', async ({ page }) => {
  await gotoCalculadora(page);

  await answerAlimentos(page, 'first');
  await answerTransporte(page, 'first');
  await answerHabitantesHogar(page, 1);
  await answerEnergia(page, 'first');
  await answerForestal(page, 'first');

  // The results screen is recomputed from the saved answers after reload
  await page.reload();
  await expect(page.getByText('Tu resultado')).toBeVisible();

  // "Revisar mis respuestas" goes back to the last step keeping the answers
  await page.getByRole('button', { name: 'Revisar mis respuestas' }).click();
  await expect(page.getByText('Pregunta 31 de 31')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Finalizar' })).toBeEnabled();
  await clickFinalizar(page);

  await page.getByRole('button', { name: 'Contestar de nuevo' }).click();
  await expect(page.getByText('Pregunta 1 de 31')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
  const guardado = await page.evaluate(() => localStorage.getItem('ecocampus:calculadora:v1'));
  expect(guardado).toBeNull();
});

}); // end test.describe
