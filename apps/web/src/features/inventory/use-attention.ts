import {
  attentionOf,
  priciestItemIds,
  type Attention,
  type AttentionContext,
  type AttentionItem,
} from '@fridgeai/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback } from 'react';
import { useAppData } from '../../app/AppData';
import { useExtra } from '../../app/extras';

const NOT_IM_BLICK: Attention = { reasons: [] };

/**
 * «Im Blick» (ADR-0073): one rule for the list, Start and the item page, so they agree. Returns a
 * function that says why an item deserves a closer look; while the household data loads, or when
 * it cannot be read, nothing is «im Blick» (the marker is a hint, never a requirement).
 */
export function useAttention(): (item: AttentionItem) => Attention {
  const { householdId, inventory, today } = useAppData();
  const context = useLiveQuery(async (): Promise<AttentionContext> => {
    const { items } = await inventory['inventory.list']({ householdId });
    const { habits } = await inventory['products.wasteHabits']({ householdId });
    return {
      today,
      priciestIds: priciestItemIds(items),
      wastedTimes: new Map(habits.map((habit) => [habit.categoryId, habit.times])),
    };
  }, [householdId, today]);
  // «Im Blick» belongs to the extra group «Hinweise» (ADR-0095): off, no item carries the {i}.
  const shown = useExtra('hints');
  return useCallback(
    (item) => (!shown || context === undefined ? NOT_IM_BLICK : attentionOf(item, context)),
    [context, shown],
  );
}
