import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useToastTimer } from './use-toast-timer';

function Toast() {
  const [open, setOpen] = useState(true);
  const pause = useToastTimer(open ? 'on' : null, 8000, () => {
    setOpen(false);
  });
  return open ? (
    <div data-testid="toast" {...pause}>
      <button type="button">Rückgängig</button>
    </div>
  ) : null;
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('useToastTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('closes the toast after the time', () => {
    render(<Toast />);
    advance(7999);
    expect(screen.queryByTestId('toast')).not.toBeNull();
    advance(1);
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('waits while the pointer is over it and restarts with the full time', () => {
    render(<Toast />);
    const toast = screen.getByTestId('toast');
    advance(5000);
    fireEvent.pointerEnter(toast);
    advance(60000);
    expect(screen.queryByTestId('toast')).not.toBeNull();
    fireEvent.pointerLeave(toast);
    advance(7999);
    expect(screen.queryByTestId('toast')).not.toBeNull();
    advance(1);
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('waits while focus is inside it', () => {
    render(<Toast />);
    const button = screen.getByRole('button', { name: 'Rückgängig' });
    fireEvent.focus(button);
    advance(60000);
    expect(screen.queryByTestId('toast')).not.toBeNull();
    fireEvent.blur(button);
    advance(8000);
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('pauses on a touch and restarts with the full time when the finger lifts', () => {
    render(<Toast />);
    const toast = screen.getByTestId('toast');
    advance(5000);
    fireEvent.pointerEnter(toast, { pointerType: 'touch' });
    advance(60000);
    expect(screen.queryByTestId('toast')).not.toBeNull();
    fireEvent.pointerLeave(toast, { pointerType: 'touch' });
    advance(7999);
    expect(screen.queryByTestId('toast')).not.toBeNull();
    advance(1);
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('runs the next toast out even if the focused button vanished without a blur', () => {
    function Persistent() {
      const [toast, setToast] = useState<string | null>('first');
      const pause = useToastTimer(toast, 8000, () => {
        setToast(null);
      });
      return (
        <div data-testid="host" {...pause}>
          {toast === null ? null : (
            <button
              type="button"
              onClick={() => {
                setToast(null);
              }}
            >
              Rückgängig
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setToast('second');
            }}
          >
            Neu
          </button>
        </div>
      );
    }
    render(<Persistent />);
    const undo = screen.getByRole('button', { name: 'Rückgängig' });
    fireEvent.focus(undo);
    fireEvent.pointerEnter(screen.getByTestId('host'));
    fireEvent.click(undo);
    expect(screen.queryByRole('button', { name: 'Rückgängig' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Neu' }));
    expect(screen.queryByRole('button', { name: 'Rückgängig' })).not.toBeNull();
    advance(8000);
    expect(screen.queryByRole('button', { name: 'Rückgängig' })).toBeNull();
  });
});
