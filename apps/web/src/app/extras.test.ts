import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ALL_EXTRAS,
  ESSENTIALS,
  EXTRA_GROUPS,
  isShown,
  parseExtras,
  readExtras,
  shownGroups,
  startWithEssentials,
  useExtra,
  writeExtras,
} from './extras';

const KEY = 'fridgeai:extras';

afterEach(() => {
  window.localStorage.removeItem(KEY);
});

describe('parseExtras', () => {
  it('shows everything without a choice or with a broken one', () => {
    expect(parseExtras(null)).toEqual(ALL_EXTRAS);
    expect(parseExtras('not json')).toEqual(ALL_EXTRAS);
    expect(parseExtras('42')).toEqual(ALL_EXTRAS);
  });

  it('reads the switch and each group, unknown groups count as shown', () => {
    const state = parseExtras(JSON.stringify({ on: false, groups: { nutrition: false } }));
    expect(state.on).toBe(false);
    expect(state.groups.nutrition).toBe(false);
    expect(state.groups.household).toBe(true);
    expect(Object.keys(state.groups)).toEqual([...EXTRA_GROUPS]);
  });
});

describe('isShown', () => {
  it('needs «Erweitert» and the group', () => {
    expect(isShown(ALL_EXTRAS, 'spots')).toBe(true);
    expect(isShown(ESSENTIALS, 'spots')).toBe(false);
    const noSpots = { on: true, groups: { ...ALL_EXTRAS.groups, spots: false } };
    expect(isShown(noSpots, 'spots')).toBe(false);
    expect(isShown(noSpots, 'cooking')).toBe(true);
  });
});

describe('shownGroups', () => {
  it('answers for every group at once', () => {
    expect(Object.values(shownGroups(ESSENTIALS)).every((shown) => !shown)).toBe(true);
    expect(shownGroups({ on: true, groups: { ...ALL_EXTRAS.groups, nutrition: false } })).toEqual({
      ...ALL_EXTRAS.groups,
      nutrition: false,
    });
  });
});

describe('startWithEssentials', () => {
  it('sets the essentials for a new person, once', () => {
    window.localStorage.removeItem(KEY);
    startWithEssentials();
    expect(readExtras()).toEqual(ESSENTIALS);
    writeExtras(ALL_EXTRAS);
    startWithEssentials();
    expect(readExtras()).toEqual(ALL_EXTRAS);
  });
});

describe('useExtra', () => {
  it('follows a switch at once', () => {
    writeExtras(ESSENTIALS);
    const { result } = renderHook(() => useExtra('insights'));
    expect(result.current).toBe(false);
    act(() => {
      writeExtras(ALL_EXTRAS);
    });
    expect(result.current).toBe(true);
  });

  it('keeps the same state object while nothing changed', () => {
    writeExtras(ESSENTIALS);
    expect(readExtras()).toBe(readExtras());
  });
});
