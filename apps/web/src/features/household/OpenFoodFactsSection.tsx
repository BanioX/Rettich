import { Globe } from 'lucide-react';
import { messages } from '../../app/messages.de-CH';
import { setOpenFoodFacts, useOpenFoodFacts } from '../../app/open-food-facts-setting';
import { Card } from '../../ui/Card';
import { Switch } from '../../ui/Switch';

const t = messages.openFoodFacts;

/**
 * «Open Food Facts» in «Deine Daten» (ADR-0096): the person decides whether Rettich may ask the
 * open product database. Off, nothing leaves the device for product data.
 */
export function OpenFoodFactsSection() {
  const on = useOpenFoodFacts();
  return (
    <section aria-labelledby="off-section-title" className="space-y-3">
      <h2
        id="off-section-title"
        className="flex items-center gap-2 font-display text-xl font-semibold"
      >
        <Globe size={22} aria-hidden="true" className="text-basil-700" />
        {t.title}
      </h2>
      <Card className="space-y-2">
        <div className="flex min-h-11 items-center justify-between gap-4">
          <span id="off-switch-label" className="font-semibold">
            {t.switchLabel}
          </span>
          <Switch
            checked={on}
            labelledBy="off-switch-label"
            describedBy="off-switch-text"
            onChange={setOpenFoodFacts}
          />
        </div>
        <p id="off-switch-text" className="text-sm text-ink-muted">
          {on ? t.on : t.off}
        </p>
      </Card>
    </section>
  );
}
