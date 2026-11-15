import 'fake-indexeddb/auto';
import type { InventoryItemView } from '@fridgeai/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { AppDataProvider, useAppData } from '../../app/AppData';
import { seedDb } from '../../app/test-seed';
import { testDb } from '../../data/test-helpers';
import { useSettleSelected } from './use-settle-selected';

/** Settles every item of the Vorrat as «Verwertet» when the button is pressed. */
function Harness({ minStock }: { minStock: boolean }) {
  const { householdId, ids, inventory } = useAppData();
  const settler = useSettleSelected();
  const [items, setItems] = useState<readonly InventoryItemView[]>([]);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          void (async () => {
            const { items: all } = await inventory['inventory.list']({ householdId });
            if (minStock) {
              for (const item of all) {
                await inventory['products.setMinStock']({
                  commandId: ids.next(),
                  householdId,
                  productId: item.productId,
                  minStock: 1,
                });
              }
            }
            setItems(all);
            await settler.settle(all, 'eaten');
          })();
        }}
      >
        settle
      </button>
      <output>{items.length}</output>
      {settler.toast}
    </>
  );
}

async function run(minStock: boolean, names: string[]) {
  const db = testDb();
  await seedDb(
    db,
    names.map((name) => ({ name, location: 'fridge' as const, inDays: 10 })),
  );
  render(
    <AppDataProvider db={db}>
      <Harness minStock={minStock} />
    </AppDataProvider>,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'settle' }));
}

describe('the pots and the minimum stock (ADR-0059)', () => {
  afterEach(cleanup);

  it('tells in the toast that one product is on «Nachkaufen» now', async () => {
    await run(true, ['Vollmilch']);
    expect(await screen.findByText('Steht jetzt auf «Nachkaufen».')).toBeDefined();
  });

  it('uses the plural when several products landed on the list', async () => {
    await run(true, ['Vollmilch', 'Butter']);
    expect(await screen.findByText('2 Artikel stehen jetzt auf «Nachkaufen».')).toBeDefined();
  });

  it('says nothing without a minimum stock', async () => {
    await run(false, ['Vollmilch']);
    expect(await screen.findByText('Vollmilch verwertet.')).toBeDefined();
    expect(screen.queryByText(/Nachkaufen/)).toBeNull();
  });
});
