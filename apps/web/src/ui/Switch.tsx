interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Id of the visible text that names the switch. */
  labelledBy: string;
  /** Id of a short explanation under the name. */
  describedBy?: string;
  disabled?: boolean;
}

/** An iOS switch (ADR-0021): 56 × 32 px, emerald when on, with `role="switch"` for screen readers. */
export function Switch({ checked, onChange, labelledBy, describedBy, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => {
        onChange(!checked);
      }}
      className={`relative h-8 w-14 shrink-0 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil-600 disabled:opacity-50 ${
        checked ? 'border-basil-700 bg-basil-700' : 'border-line bg-surface-muted'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-card transition-transform ${
          checked ? 'translate-x-6' : ''
        }`}
      />
    </button>
  );
}
