import type { Id, InventoryItemView } from '@fridgeai/core';
import { Undo2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAppData } from '../../app/AppData';
import { messages } from '../../app/messages.de-CH';
import { Button } from '../../ui/Button';
import { ChoiceChips } from '../../ui/ChoiceChips';
import { onListHint } from './min-stock-hint';
import { outcomeText, planOutcome, rebuyText } from './settle';
import { createPortal } from 'react-dom';
import { useToastTimer } from './use-toast-timer';

/** The toast stays this long, like the swipe toast; a hint needs a moment longer to read. */
const TOAST_MS = 8000;
const HINT_TOAST_MS = 10000;

type Answer = 'yes' | 'no';

interface Asking {
  items: readonly InventoryItemView[];
  /** `null`: «Abbrechen». */
  answer: (answer: Answer | null) => void;
}

interface Toast {
  text: string;
  hint?: string;
  /** Second line after deleting several items: the first names, then «und N weitere». */
  names?: string;
  /** Event ids of the outcomes just recorded; `null` when there is nothing to undo. */
  undo: Id[] | null;
  /** The undo restores deleted items (`undo` holds item ids) instead of undoing outcomes. */
  restore?: true;
}

/**
 * The pots (ADR-0055): settles the chosen items with one tap or drop. «Verwertet» and «Entsorgt»
 * record the whole rest of each item with `inventory.recordOutcome`; food that was about to go off
 * first asks once «Ohne Rettich im Abfall gelandet?» (ADR-0039). «Nachkaufen» puts the products on
 * the shopping list and leaves the stock alone. «Löschen» removes wrong entries (soft delete, no
 * outcome, no statistics) and can be undone by restoring them. `settle` resolves to `true` only
 * when everything worked, so the caller ends select mode; otherwise what failed is named and
 * stays selected.
 */
export function useSettleSelected(): {
  busy: boolean;
  settle: (
    items: readonly InventoryItemView[],
    action: 'eaten' | 'wasted' | 'rebuy' | 'delete',
  ) => Promise<boolean>;
  toast: ReactNode;
} {
  const { householdId, ids, inventory, shopping, today } = useAppData();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [asking, setAsking] = useState<Asking | null>(null);
  /** Set at once, before React renders `busy`: a second tap in the same moment does nothing. */
  const running = useRef(false);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);
  const pause = useToastTimer(
    toast,
    toast?.hint === undefined ? TOAST_MS : HINT_TOAST_MS,
    closeToast,
  );

  const ask = useCallback(
    (items: readonly InventoryItemView[]) =>
      new Promise<Answer | null>((resolve) => {
        setAsking({
          items,
          answer: (answer) => {
            setAsking(null);
            resolve(answer);
          },
        });
      }),
    [],
  );

  const settleOutcome = useCallback(
    async (items: readonly InventoryItemView[], outcome: 'eaten' | 'wasted') => {
      const plan = planOutcome(items, outcome, today);
      let rescued: Answer = 'no';
      if (plan.rescueQuestion.length > 0) {
        const answer = await ask(plan.rescueQuestion);
        if (answer === null) {
          return false;
        }
        rescued = answer;
      }
      const toRescue = new Set(plan.rescueQuestion.map((item) => item.id));
      const done: InventoryItemView[] = [];
      const eventIds: Id[] = [];
      const failed: InventoryItemView[] = [];
      let onList = 0;
      setBusy(true);
      for (const item of items) {
        try {
          const result = await inventory['inventory.recordOutcome']({
            commandId: ids.next(),
            householdId,
            itemId: item.id,
            outcome,
            ...(rescued === 'yes' && toRescue.has(item.id) ? { rescued: true } : {}),
          });
          done.push(item);
          eventIds.push(result.eventId);
          if (result.addedToList === true) {
            onList += 1;
          }
        } catch {
          failed.push(item);
        }
      }
      const parts = [
        done.length === 0
          ? ''
          : outcomeText(
              done.map((item) => item.name),
              outcome,
            ),
        failed.length === 0
          ? ''
          : messages.inventory.settle.failedSome(failed.map((item) => item.name)),
      ].filter((part) => part !== '');
      const lines = [
        planOutcome(done, outcome, today).askStillGood ? messages.rescue.stillGood : undefined,
        onListHint(onList),
      ].filter((line) => line !== undefined);
      const hint = lines.length === 0 ? undefined : lines.join(' ');
      setToast({
        text: parts.join(' '),
        ...(hint === undefined ? {} : { hint }),
        undo: eventIds.length === 0 ? null : eventIds,
      });
      return failed.length === 0;
    },
    [ask, householdId, ids, inventory, today],
  );

  const rebuy = useCallback(
    async (items: readonly InventoryItemView[]) => {
      setBusy(true);
      const added: string[] = [];
      const already: string[] = [];
      const failed: string[] = [];
      for (const item of items) {
        try {
          const result = await shopping['shopping.addItem']({
            commandId: ids.next(),
            householdId,
            name: item.name.slice(0, 80),
          });
          (result.alreadyOnList ? already : added).push(item.name);
        } catch {
          failed.push(item.name);
        }
      }
      const parts = [
        rebuyText(added, already),
        failed.length === 0 ? '' : messages.inventory.settle.failedSome(failed),
      ].filter((part) => part !== '');
      setToast({ text: parts.join(' '), undo: null });
      return failed.length === 0;
    },
    [householdId, ids, shopping],
  );

  const remove = useCallback(
    async (items: readonly InventoryItemView[]) => {
      setBusy(true);
      const done: InventoryItemView[] = [];
      const failed: string[] = [];
      for (const item of items) {
        try {
          await inventory['inventory.deleteItem']({
            commandId: ids.next(),
            householdId,
            itemId: item.id,
          });
          done.push(item);
        } catch {
          failed.push(item.name);
        }
      }
      const t = messages.inventory.settle;
      const parts = [
        done.length === 0
          ? ''
          : done.length === 1
            ? t.deletedOne(done[0]?.name ?? '')
            : t.deletedMany(done.length),
        failed.length === 0 ? '' : t.failedSome(failed),
      ].filter((part) => part !== '');
      setToast({
        text: parts.join(' '),
        ...(done.length > 1 ? { names: t.deletedNames(done.map((item) => item.name)) } : {}),
        undo: done.length === 0 ? null : done.map((item) => item.id),
        ...(done.length === 0 ? {} : { restore: true as const }),
      });
      return failed.length === 0;
    },
    [householdId, ids, inventory],
  );

  const settle = useCallback(
    async (
      items: readonly InventoryItemView[],
      action: 'eaten' | 'wasted' | 'rebuy' | 'delete',
    ) => {
      if (running.current || items.length === 0) {
        return false;
      }
      running.current = true;
      try {
        if (action === 'delete') {
          return await remove(items);
        }
        return action === 'rebuy' ? await rebuy(items) : await settleOutcome(items, action);
      } catch {
        setToast({ text: messages.inventory.select.failed, undo: null });
        return false;
      } finally {
        running.current = false;
        setBusy(false);
      }
    },
    [rebuy, remove, settleOutcome],
  );

  const undo = async (itemOrEventIds: readonly Id[], restore: boolean) => {
    if (running.current) {
      return;
    }
    running.current = true;
    setBusy(true);
    try {
      for (const id of itemOrEventIds) {
        if (restore) {
          await inventory['inventory.restoreItem']({
            commandId: ids.next(),
            householdId,
            itemId: id,
          });
        } else {
          await inventory['inventory.undoOutcome']({
            commandId: ids.next(),
            householdId,
            eventId: id,
          });
        }
      }
      setToast(null);
    } catch {
      setToast({ text: messages.inventory.undoFailed, undo: null });
    } finally {
      running.current = false;
      setBusy(false);
    }
  };

  return {
    busy,
    settle,
    // The live region stays mounted and only its content changes, so screen readers announce it.
    toast: (
      <>
        {asking === null ? null : <RescueSheet asking={asking} />}
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] lg:left-64 z-20 mx-auto max-w-xl px-4">
          <div
            role="status"
            {...pause}
            className="pointer-events-auto flex items-center justify-between gap-2 rounded-2xl bg-onyx py-2 pr-2 pl-4 text-white shadow-card empty:hidden"
          >
            {toast === null ? null : (
              <>
                <div>
                  <p className="font-semibold">{toast.text}</p>
                  {toast.names === undefined ? null : (
                    <p className="text-sm text-white/80">{toast.names}</p>
                  )}
                  {toast.hint === undefined ? null : (
                    <p className="text-sm text-white/80">{toast.hint}</p>
                  )}
                </div>
                {toast.undo === null ? null : (
                  <button
                    type="button"
                    disabled={busy}
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
                    onClick={() => {
                      void undo(toast.undo ?? [], toast.restore === true);
                    }}
                  >
                    <Undo2 size={20} aria-hidden="true" />
                    {messages.inventory.undo}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </>
    ),
  };
}

const rescueOptions = [
  { value: 'yes' as const, label: messages.itemDetail.rescueYes },
  { value: 'no' as const, label: messages.itemDetail.rescueNo },
];

/** «Ohne Rettich im Abfall gelandet?»: one answer for all the food that was about to go off. */
function RescueSheet({ asking }: { asking: Asking }) {
  const t = messages.inventory.settle;
  const [rescued, setRescued] = useState<Answer>('no');
  const { answer } = asking;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        answer(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [answer]);

  // On the body, so the tab bar does not cover the bottom of the sheet (ADR-0082).
  return createPortal(
    <div className="sheet-backdrop">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="rescue-sheet-title"
        aria-describedby="rescue-sheet-body"
        className="sheet-panel space-y-4"
      >
        <h2 id="rescue-sheet-title" className="font-display text-xl font-semibold">
          {messages.itemDetail.rescueQuestion}
        </h2>
        <ul id="rescue-sheet-body" className="space-y-1">
          {asking.items.map((item) => (
            <li key={item.id} className="font-semibold">
              {item.name}
            </li>
          ))}
        </ul>
        <ChoiceChips
          legend={messages.itemDetail.rescueQuestion}
          hideLegend
          options={rescueOptions}
          value={rescued}
          onChange={setRescued}
          segmented
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            fullWidth
            autoFocus
            onClick={() => {
              answer(rescued);
            }}
          >
            {t.rescueConfirm}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              answer(null);
            }}
          >
            {t.cancel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
