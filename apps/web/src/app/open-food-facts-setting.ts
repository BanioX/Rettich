import { useSyncExternalStore } from 'react';

/**
 * Whether Rettich may ask Open Food Facts (ADR-0096): unknown barcodes, the name search and
 * receipt lines without a hit on the device. Off, nothing goes out; Rettich knows the shipped
 * catalog and the person's own products. A new person starts with it off, people who already use
 * Rettich keep it on. A choice of this device, like the essentials switch (ADR-0095).
 */
const KEY = 'fridgeai:open-food-facts';
const CHANGE = 'rettich-open-food-facts-change';

function storage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/** Only when the browser refuses storage: the choice holds until the page closes. */
let fallback: 'on' | 'off' | null = null;

function rawValue(): string | null {
  try {
    return storage()?.getItem(KEY) ?? fallback;
  } catch {
    return fallback;
  }
}

/** Unknown values count as on: nobody loses what worked before by accident. */
export function openFoodFactsAllowed(): boolean {
  return rawValue() !== 'off';
}

export function setOpenFoodFacts(on: boolean): void {
  const value = on ? 'on' : 'off';
  try {
    storage()?.setItem(KEY, value);
    fallback = null;
  } catch {
    fallback = value;
  }
  window.dispatchEvent(new Event(CHANGE));
}

/** A household was just created on this device: start without Open Food Facts, once. */
export function startWithoutOpenFoodFacts(): void {
  try {
    if (storage()?.getItem(KEY) === null) {
      setOpenFoodFacts(false);
    }
  } catch {
    // Without storage Rettich keeps asking, as before.
  }
}

function subscribe(listener: () => void): () => void {
  window.addEventListener(CHANGE, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(CHANGE, listener);
    window.removeEventListener('storage', listener);
  };
}

export function useOpenFoodFacts(): boolean {
  return useSyncExternalStore(subscribe, openFoodFactsAllowed, openFoodFactsAllowed);
}
