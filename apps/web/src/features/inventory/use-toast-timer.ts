import { useEffect, useState, type FocusEvent } from 'react';

/**
 * Closes a toast after `ms`, but not while the person is in it (WCAG 2.2.1): the timer stops while
 * the pointer (mouse or finger) is over the toast or focus is inside it, and starts again with the
 * full time when the person leaves. `props` go on the toast element.
 */
export function useToastTimer(
  /** The toast; a new value starts the time afresh. `null`: nothing to close. */
  toast: unknown,
  ms: number,
  close: () => void,
) {
  const [over, setOver] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = over || focused;
  const hidden = toast === null;

  // The toast element stays mounted and only its content changes, so a button that had focus can
  // vanish without a blur event, and a pointer can leave without a leave event. Forget both once
  // the toast is gone, or the next toast would never start its timer.
  if (hidden && (over || focused)) {
    setOver(false);
    setFocused(false);
  }

  useEffect(() => {
    if (toast === null || paused) {
      return undefined;
    }
    const timer = window.setTimeout(close, ms);
    return () => {
      window.clearTimeout(timer);
    };
  }, [toast, paused, ms, close]);

  return {
    onPointerEnter: () => {
      setOver(true);
    },
    // On touch screens `pointerleave` fires right after the finger lifts: the pause lasts while the
    // finger rests on the toast, then the full time starts again (deliberate restart).
    onPointerLeave: () => {
      setOver(false);
    },
    onPointerCancel: () => {
      setOver(false);
    },
    onFocus: () => {
      setFocused(true);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setFocused(false);
      }
    },
  };
}
