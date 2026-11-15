import 'fake-indexeddb/auto';
import type { InventoryItemView } from '@fridgeai/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

describe('the «Löschen» pot', () => {
  afterEach(cleanup);

  /** Deletes every item of the Vorrat; `spy` watches the commands. */
  function DeleteHarness({ onDone }: { onDone: (items: readonly InventoryItemView[]) => void }) {
    const { householdId, inventory } = useAppData();
    const settler = useSettleSelected();
    return (
      <>
        <button
          type="button"
          onClick={() => {
            void (async () => {
              const { items } = await inventory['inventory.list']({ householdId });
              await settler.settle(items, 'delete');
              onDone(items);
            })();
          }}
        >
          delete
        </button>
        {settler.toast}
      </>
    );
  }

  async function setup(names: string[]) {
    const db = testDb();
    await seedDb(
      db,
      names.map((name) => ({ name, location: 'fridge' as const, inDays: 10 })),
    );
    const done = vi.fn();
    const calls: {
      record?: ReturnType<typeof vi.fn>;
      remove?: ReturnType<typeof vi.fn>;
      restore?: ReturnType<typeof vi.fn>;
    } = {};
    function Spy() {
      const { inventory } = useAppData();
      useEffect(() => {
        calls.record = vi.spyOn(inventory, 'inventory.recordOutcome');
        calls.remove = vi.spyOn(inventory, 'inventory.deleteItem');
        calls.restore = vi.spyOn(inventory, 'inventory.restoreItem');
      }, [inventory]);
      return null;
    }
    render(
      <AppDataProvider db={db}>
        <Spy />
        <DeleteHarness onDone={done} />
      </AppDataProvider>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'delete' }));
    return { calls, done };
  }

  it('names up to three deleted items on a second line, then «und N weitere»', async () => {
    await setup(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon']);
    expect(await screen.findByText('5 Artikel gelöscht.')).toBeDefined();
    expect(screen.getByText(/und 2 weitere$/)).toBeDefined();
  });

  it('deletes one item without an outcome and names it in the toast', async () => {
    const { calls } = await setup(['Testbuch']);
    expect(await screen.findByText('Testbuch gelöscht.')).toBeDefined();
    expect(calls.remove).toHaveBeenCalledTimes(1);
    expect(calls.record).not.toHaveBeenCalled();
    expect(screen.queryByText(/Ist das noch gut/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Rückgängig' })).toBeDefined();
  });

  it('counts several items and restores them all with «Rückgängig»', async () => {
    const { calls } = await setup(['Testbuch', 'Probeartikel', 'Musterkarte']);
    expect(await screen.findByText('3 Artikel gelöscht.')).toBeDefined();
    expect(calls.remove).toHaveBeenCalledTimes(3);
    expect(calls.record).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Rückgängig' }));
    await vi.waitFor(() => {
      expect(screen.queryByText('3 Artikel gelöscht.')).toBeNull();
    });
    expect(calls.restore).toHaveBeenCalledTimes(3);
  });
});
