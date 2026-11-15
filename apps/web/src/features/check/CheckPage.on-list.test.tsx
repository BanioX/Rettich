import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { useEffect, useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { AppDataProvider, useAppData } from '../../app/AppData';
import { seedDb } from '../../app/test-seed';
import { testDb } from '../../data/test-helpers';
import { CheckPage } from './CheckPage';

/** Puts every product of the household on «Nachkaufen» through the minimum stock, then reports. */
function SetMinStock({ onDone }: { onDone: (ready: boolean) => void }) {
  const { householdId, ids, inventory } = useAppData();
  useEffect(() => {
    void (async () => {
      const { items } = await inventory['inventory.list']({ householdId });
      for (const item of items) {
        await inventory['products.setMinStock']({
          commandId: ids.next(),
          householdId,
          productId: item.productId,
          minStock: 1,
        });
      }
      onDone(true);
    })();
  }, [householdId, ids, inventory, onDone]);
  return null;
}

/** The check opens only once the minimum stock is in place. */
function Gate() {
  const [ready, setReady] = useState(false);
  return (
    <>
      <SetMinStock onDone={setReady} />
      {ready ? <CheckPage /> : null}
    </>
  );
}

async function renderCheck() {
  const db = testDb();
  await seedDb(db, [
    { name: 'Vollmilch', location: 'fridge', inDays: 10 },
    { name: 'Butter', location: 'fridge', inDays: 10 },
  ]);
  render(
    <AppDataProvider db={db}>
      <MemoryRouter>
        <Gate />
      </MemoryRouter>
    </AppDataProvider>,
  );
  await screen.findByRole('heading', { level: 2 });
}

/** Presses an answer once it is enabled again: the buttons stay disabled while a step is saved. */
async function press(name: string): Promise<void> {
  const button = await waitFor(() => {
    const found = screen.getByRole('button', { name });
    if (found.hasAttribute('disabled')) {
      throw new Error(`${name} is still busy`);
    }
    return found;
  });
  fireEvent.click(button);
}

describe('Kühlschrank-Check: «Nachkaufen» (ADR-0059)', () => {
  afterEach(cleanup);

  it('still counts the products on the list after «Zurück» undid a step', async () => {
    await renderCheck();
    // The first product goes on the list, then «Zurück» undoes it: it stays on the list.
    await press('Entsorgt');
    await press('Zurück');
    // Answering again: the minimum stock does not add it twice, the second product does.
    await press('Entsorgt');
    await press('Verwertet');
    expect(await screen.findByText('2 Artikel stehen jetzt auf «Nachkaufen».')).toBeDefined();
  }, 20_000);
});
