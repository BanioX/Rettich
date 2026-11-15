import { AxeBuilder, expect, test } from './test';

test.describe('a new person', () => {
  test.use({ newPerson: true });

  test('starts with the essentials and switches the extras on, group by group', async ({
    page,
  }) => {
    await page.goto('/more');
    const more = page.getByRole('main');
    await expect(more.getByRole('link', { name: /^Journal/ })).toBeVisible();
    await expect(more.getByRole('link', { name: /^Nachkaufen/ })).toBeVisible();
    await expect(more.getByRole('link', { name: /^Deine Daten/ })).toBeVisible();
    for (const hidden of [/^Klimabilanz/, /^Wo ist was\?/, /^Personen/, /^Ferien-Check/]) {
      await expect(more.getByRole('link', { name: hidden })).toHaveCount(0);
    }

    await more.getByRole('link', { name: /^Funktionen.*Grundfunktionen/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Funktionen' })).toBeVisible();
    const extended = page.getByRole('switch', { name: 'Erweitert' });
    await expect(extended).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByRole('switch', { name: 'Auswertung' })).toHaveCount(0);

    await extended.click();
    await expect(extended).toHaveAttribute('aria-checked', 'true');
    const insights = page.getByRole('switch', { name: 'Auswertung' });
    await expect(insights).toHaveAttribute('aria-checked', 'true');
    await insights.click();
    await expect(insights).toHaveAttribute('aria-checked', 'false');
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    // The choice stays on this device and every surface follows it.
    await page.reload();
    await expect(page.getByRole('switch', { name: 'Auswertung' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    await page.getByRole('link', { name: 'Mehr' }).first().click();
    await expect(more.getByRole('link', { name: /^Wo ist was\?/ })).toBeVisible();
    await expect(more.getByRole('link', { name: /^Personen/ })).toBeVisible();
    await expect(more.getByRole('link', { name: /^Klimabilanz/ })).toHaveCount(0);
    await expect(more.getByRole('link', { name: /^Funktionen.*Erweitert/ })).toBeVisible();
  });
});

test.describe('a new person under «Wissen»', () => {
  test.use({ newPerson: true });

  test('reads only about the essentials, recipes appear with «Kochen»', async ({ page }) => {
    await page.goto('/knowledge');
    await expect(page.getByRole('heading', { level: 2, name: 'Rettich im Alltag' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Rezepte' })).toHaveCount(0);
    await expect(page.getByText('Funktionen', { exact: true })).toBeVisible();
    await expect(page.getByText('Klimabilanz', { exact: true })).toHaveCount(0);

    await page.goto('/more/extras');
    await page.getByRole('switch', { name: 'Erweitert' }).click();
    await page.goto('/knowledge');
    await expect(page.getByRole('heading', { level: 2, name: 'Rezepte' })).toBeVisible();
    await expect(page.getByText('Klimabilanz', { exact: true })).toBeVisible();
  });
});

test.describe('a new person in Vorrat, on an item and under Erfassen', () => {
  test.use({ newPerson: true });

  test('sees the essentials, and the extras once «Erweitert» is on', async ({ page }) => {
    await page.goto('/inventory/new');
    await page.getByLabel('Was ist es?').fill('Joghurt');
    await page.getByRole('button', { name: 'Speichern', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Vorrat' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Auswählen' })).toHaveCount(0);
    await expect(page.getByRole('radio', { name: /Nach Art/ })).toHaveCount(0);

    await page
      .getByRole('link', { name: /Joghurt/ })
      .first()
      .click();
    await expect(page.getByRole('heading', { level: 1, name: 'Joghurt' })).toBeVisible();
    for (const extra of [/Platz festhalten/, /^Verarbeiten$/, /Im Kalender erinnern/]) {
      await expect(
        page.getByRole('button', { name: extra }).or(page.getByRole('link', { name: extra })),
      ).toHaveCount(0);
    }
    await expect(page.getByText('Immer da haben')).toHaveCount(0);

    await page.goto('/add');
    await expect(page.getByRole('link', { name: /Reste erfassen/ })).toHaveCount(0);

    await page.goto('/more/extras');
    await page.getByRole('switch', { name: 'Erweitert' }).click();
    await page.goto('/add');
    await expect(page.getByRole('link', { name: /Reste erfassen/ })).toBeVisible();
    await page.goto('/inventory');
    await expect(page.getByRole('button', { name: 'Auswählen' })).toBeVisible();
    await page
      .getByRole('link', { name: /Joghurt/ })
      .first()
      .click();
    await expect(page.getByRole('button', { name: /Platz festhalten/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Verarbeiten$/ })).toBeVisible();
    await expect(page.getByText('Immer da haben')).toBeVisible();
  });
});

test('a person who already uses Rettich keeps every function', async ({ page }) => {
  await page.goto('/more');
  for (const shown of [/^Klimabilanz/, /^Wo ist was\?/, /^Personen/, /^Funktionen.*Erweitert/]) {
    await expect(page.getByRole('main').getByRole('link', { name: shown })).toBeVisible();
  }
});
