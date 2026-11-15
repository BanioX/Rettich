import { messages } from '../../app/messages.de-CH';

/**
 * The calm line «Steht jetzt auf «Nachkaufen».» after outcomes that the minimum stock put on the
 * shopping list (ADR-0059): singular for one product, plural for several, nothing for none.
 */
export function onListHint(count: number): string | undefined {
  if (count <= 0) {
    return undefined;
  }
  return count === 1 ? messages.minStock.onList : messages.minStock.onListMany(count);
}
