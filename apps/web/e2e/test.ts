import BaseAxeBuilder from '@axe-core/playwright';
import { test as base, type Page } from '@playwright/test';

export { expect } from '@playwright/test';

/**
 * Every test: Open Food Facts is never called for real. The name search (ADR-0025) asks while
 * typing, so each test starts with an empty search answer; a spec's own `page.route` wins.
 */
export const test = base.extend<{
  noOpenFoodFacts: undefined;
  newPerson: boolean;
  allExtras: undefined;
}>({
  /** `test.use({ newPerson: true })`: start like a new person, with the essentials (ADR-0095). */
  newPerson: [false, { option: true }],
  /**
   * Every other test sees all functions, as people with data do. Set only when nothing is chosen
   * yet, so a switch flipped in a test survives the next page load.
   */
  allExtras: [
    async ({ context, newPerson }, provide) => {
      if (!newPerson) {
        await context.addInitScript(() => {
          if (window.localStorage.getItem('fridgeai:extras') === null) {
            window.localStorage.setItem(
              'fridgeai:extras',
              JSON.stringify({ on: true, groups: {} }),
            );
          }
          // Open Food Facts on, as before ADR-0096; every request is answered by the mock below.
          if (window.localStorage.getItem('fridgeai:open-food-facts') === null) {
            window.localStorage.setItem('fridgeai:open-food-facts', 'on');
          }
        });
      }
      await provide(undefined);
    },
    { auto: true },
  ],
  noOpenFoodFacts: [
    async ({ context }, provide) => {
      await context.route('https://*.openfoodfacts.org/**', (route) =>
        route.request().url().includes('/cgi/search.pl')
          ? route.fulfill({ json: { count: 0, products: [] } })
          : route.abort(),
      );
      await provide(undefined);
    },
    { auto: true },
  ],
});

/**
 * Axe as in every spec, but it first waits until all transitions and animations have ended.
 * Mid-fade, colours are a little lighter than at rest, and axe reported contrast errors that a
 * person never sees (L-19). Import it from here, never from `@axe-core/playwright` (lint rule).
 */
export class AxeBuilder extends BaseAxeBuilder {
  private readonly settlePage: Page;

  constructor(options: { page: Page }) {
    super(options);
    this.settlePage = options.page;
  }

  override async analyze(): ReturnType<BaseAxeBuilder['analyze']> {
    await this.settlePage.waitForFunction(() =>
      document.getAnimations().every((animation) => animation.playState !== 'running'),
    );
    return super.analyze();
  }
}
