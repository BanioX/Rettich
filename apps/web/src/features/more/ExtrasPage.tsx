import { messages } from '../../app/messages.de-CH';
import { EXTRA_GROUPS, useExtras, writeExtras } from '../../app/extras';
import { BackLink } from '../../ui/BackLink';
import { GroupedList, GroupedListItem } from '../../ui/GroupedList';
import { Switch } from '../../ui/Switch';

const t = messages.extras;

/**
 * «Mehr › Funktionen» (ADR-0095): what «Basis» always shows, one switch for «Erweitert», under it
 * every group of extras on its own, like the iOS settings. The choice belongs to this device and changes no data.
 */
export function ExtrasPage() {
  const extras = useExtras();

  return (
    <div className="space-y-6">
      <div>
        <BackLink to="/more" label={messages.pages.more} />
        <h1 className="large-title">{messages.pages.extras}</h1>
      </div>
      <p className="text-ink-muted">{t.intro}</p>

      <section aria-labelledby="extras-basis" className="space-y-2">
        <h2 id="extras-basis" className="px-4 text-sm font-semibold text-ink-muted uppercase">
          {t.basisTitle}
        </h2>
        <GroupedList>
          <GroupedListItem className="px-4 py-3">{t.basis}</GroupedListItem>
        </GroupedList>
      </section>

      <GroupedList>
        <GroupedListItem className="space-y-1 px-4 py-3">
          <div className="flex min-h-11 items-center justify-between gap-4">
            <span id="extras-switch" className="font-semibold">
              {t.switchLabel}
            </span>
            <Switch
              checked={extras.on}
              labelledBy="extras-switch"
              describedBy="extras-switch-hint"
              onChange={(on) => {
                writeExtras({ ...extras, on });
              }}
            />
          </div>
          <p id="extras-switch-hint" className="text-sm text-ink-muted">
            {t.switchHint}
          </p>
        </GroupedListItem>
      </GroupedList>

      {extras.on ? (
        <section aria-labelledby="extras-groups" className="space-y-2">
          <h2 id="extras-groups" className="px-4 text-sm font-semibold text-ink-muted uppercase">
            {t.groupsTitle}
          </h2>
          <GroupedList>
            {EXTRA_GROUPS.map((group) => (
              <GroupedListItem
                key={group}
                className="flex min-h-14 items-center justify-between gap-4 px-4 py-2"
              >
                <div className="min-w-0">
                  <span id={`extras-${group}`} className="block font-semibold">
                    {t.groups[group].title}
                  </span>
                  <span id={`extras-${group}-detail`} className="block text-sm text-ink-muted">
                    {t.groups[group].detail}
                  </span>
                </div>
                <Switch
                  checked={extras.groups[group]}
                  labelledBy={`extras-${group}`}
                  describedBy={`extras-${group}-detail`}
                  onChange={(checked) => {
                    writeExtras({ ...extras, groups: { ...extras.groups, [group]: checked } });
                  }}
                />
              </GroupedListItem>
            ))}
          </GroupedList>
        </section>
      ) : null}
    </div>
  );
}
