import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  openFoodFactsAllowed,
  setOpenFoodFacts,
  startWithoutOpenFoodFacts,
  useOpenFoodFacts,
} from './open-food-facts-setting';

const KEY = 'fridgeai:open-food-facts';

afterEach(() => {
  window.localStorage.removeItem(KEY);
});

describe('the switch «Open Food Facts» (ADR-0096)', () => {
  it('is on without a choice, so people who use Rettich keep what they had', () => {
    window.localStorage.removeItem(KEY);
    expect(openFoodFactsAllowed()).toBe(true);
    window.localStorage.setItem(KEY, 'something');
    expect(openFoodFactsAllowed()).toBe(true);
  });

  it('starts off for a new person, once', () => {
    window.localStorage.removeItem(KEY);
    startWithoutOpenFoodFacts();
    expect(openFoodFactsAllowed()).toBe(false);
    setOpenFoodFacts(true);
    startWithoutOpenFoodFacts();
    expect(openFoodFactsAllowed()).toBe(true);
  });

  it('is followed at once', () => {
    setOpenFoodFacts(true);
    const { result } = renderHook(() => useOpenFoodFacts());
    expect(result.current).toBe(true);
    act(() => {
      setOpenFoodFacts(false);
    });
    expect(result.current).toBe(false);
  });
});
