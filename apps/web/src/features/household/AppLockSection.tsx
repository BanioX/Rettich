import { Lock } from 'lucide-react';
import { useState } from 'react';
import { messages } from '../../app/messages.de-CH';
import { useAppLock, type LockOutcome } from '../../app/lock/lock-context';
import type { LockAfter } from '../../app/lock/lock-settings';
import { ChoiceChips } from '../../ui/ChoiceChips';
import { Switch } from '../../ui/Switch';

const t = messages.appLock;

/** «App-Sperre» in «Deine Daten»: optional lock with Face ID, Touch ID or the device code (ADR-0086). */
export function AppLockSection() {
  const lock = useAppLock();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const unavailable = lock.available === false && !lock.enabled;

  async function toggle() {
    setBusy(true);
    setStatus('');
    const turningOn = !lock.enabled;
    const outcome: LockOutcome = await (turningOn ? lock.enable() : lock.disable());
    setStatus(outcome === 'ok' ? (turningOn ? t.switchedOn : t.switchedOff) : t.problem[outcome]);
    setBusy(false);
  }

  return (
    <section aria-labelledby="lock-section-title" className="space-y-3">
      <h2
        id="lock-section-title"
        className="flex items-center gap-2 font-display text-xl font-semibold"
      >
        <Lock size={22} aria-hidden="true" className="text-basil-700" />
        {t.title}
      </h2>
      <p className="text-ink-muted">{t.text}</p>
      <p className="text-ink-muted">{t.privacy}</p>
      <div className="flex min-h-11 items-center justify-between gap-4">
        <span id="lock-switch-label" className="font-semibold">
          {t.switchLabel}
        </span>
        <Switch
          checked={lock.enabled}
          labelledBy="lock-switch-label"
          disabled={busy || unavailable}
          onChange={() => void toggle()}
        />
      </div>
      {unavailable ? <p className="text-sm text-ink-muted">{t.unavailable}</p> : null}
      {lock.enabled ? (
        <>
          <ChoiceChips<LockAfter>
            legend={t.after}
            segmented
            value={lock.after}
            onChange={lock.setAfter}
            options={[
              { value: 'now', label: t.afterNow },
              { value: '1m', label: t.after1m },
              { value: '5m', label: t.after5m },
            ]}
          />
          <p className="text-sm text-ink-muted">{t.turnOffHint}</p>
        </>
      ) : null}
      <p role="status" className="font-semibold text-basil-800">
        {status}
      </p>
    </section>
  );
}
