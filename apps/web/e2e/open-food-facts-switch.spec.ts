import { AxeBuilder, expect, test } from './test';

test.describe('a new person', () => {
  test.use({ newPerson: true });

  test('starts without Open Food Facts: nothing goes out until the switch is on', async ({
    page,
  }) => {
    const asked: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('openfoodfacts.org')) {
        asked.push(request.url());
      }
    });

    await page.goto('/inventory/new');
    await page.getByLabel('Was ist es?').fill('Gipfeli Butter');
    // The name search waits for a pause in typing; give it time to ask, if it would.
    await page.waitForTimeout(1500);
    expect(asked).toEqual([]);

    await page.goto('/more/data');
    const off = page.getByRole('switch', { name: 'Produktdaten aus dem Netz' });
    await expect(off).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByText(/^Aus: Nichts geht hinaus/)).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await off.click();
    await expect(off).toHaveAttribute('aria-checked', 'true');
    await page.reload();
    await expect(page.getByRole('switch', { name: 'Produktdaten aus dem Netz' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await page.goto('/inventory/new');
    await page.getByLabel('Was ist es?').fill('Gipfeli Butter');
    await expect.poll(() => asked.length, { timeout: 10_000 }).toBeGreaterThan(0);
  });
});
