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

test('a person who already uses Rettich keeps every function', async ({ page }) => {
  await page.goto('/more');
  for (const shown of [/^Klimabilanz/, /^Wo ist was\?/, /^Personen/, /^Funktionen.*Erweitert/]) {
    await expect(page.getByRole('main').getByRole('link', { name: shown })).toBeVisible();
  }
});
