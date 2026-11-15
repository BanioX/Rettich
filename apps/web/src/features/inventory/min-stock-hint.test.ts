import { describe, expect, it } from 'vitest';
import { onListHint } from './min-stock-hint';

describe('onListHint', () => {
  it('says nothing when nothing was added', () => {
    expect(onListHint(0)).toBeUndefined();
    expect(onListHint(-1)).toBeUndefined();
  });

  it('uses the singular text for one product', () => {
    expect(onListHint(1)).toBe('Steht jetzt auf «Nachkaufen».');
  });

  it('uses the plural text and the count for several', () => {
    expect(onListHint(3)).toBe('3 Artikel stehen jetzt auf «Nachkaufen».');
  });
});
