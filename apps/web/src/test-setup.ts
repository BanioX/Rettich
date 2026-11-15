import { configure } from '@testing-library/react';
import { beforeEach } from 'vitest';
import { ALL_EXTRAS } from './app/extras';

// `findBy…` and `waitFor` give up after 1 s by default. With fake IndexedDB, Dexie live queries
// and several test runs at once (agents, CI), a correct page can take longer to settle, and the
// test then fails at random (ShoppingPage, ItemDetailMinStock). 5 s keeps real failures visible
// and stops the noise (L-30).
configure({ asyncUtilTimeout: 5000 });

// Every test sees all functions, as people with data do (ADR-0095). A test of the essentials
// removes or sets the choice itself. Tests without a DOM have no storage to prepare.
beforeEach(() => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('fridgeai:extras', JSON.stringify(ALL_EXTRAS));
    // Open Food Facts on, as for people who already use Rettich (ADR-0096); tests mock it anyway.
    window.localStorage.setItem('fridgeai:open-food-facts', 'on');
  }
});
