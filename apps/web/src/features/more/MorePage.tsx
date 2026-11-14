import { daysBetween } from '@fridgeai/core';
import {
  Award,
  ClipboardCheck,
  FileChartColumn,
  HistoryIcon,
  Leaf,
  MapPin,
  Plane,
  ShieldCheck,
  ShoppingBasket,
  SlidersHorizontal,
  Smartphone,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useAppData } from '../../app/AppData';
import { isShown, useExtras, type ExtraGroup } from '../../app/extras';
import { messages } from '../../app/messages.de-CH';
import { Card } from '../../ui/Card';
import { MenuList, type MenuEntry } from '../../ui/MenuList';
import { readLastCheck } from '../check/check-state';

const t = messages.more;

/** Already started from the home screen (iPhone: navigator.standalone, others: display mode). */
function isInstalled(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return (
    iosStandalone ||
    // Typed as always there, but missing in older WebViews and in test DOMs.
    (typeof (window.matchMedia as unknown) === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches)
  );
}

const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent);

/**
 * «Mehr» (ADR-0031): everything that is not the daily fridge – reports, Nachkaufen, the person's
 * data and privacy, the install hint – as one menu, so the tab bar keeps four clear places.
 */
export function MorePage() {
  const { today } = useAppData();
  const [lastCheck] = useState(readLastCheck);
  const extras = useExtras();
  /** Three groups as in the iOS settings (ADR-0076): what you use each week comes first. */
  const groups: { id: string; title: string; entries: (MenuEntry & { extra?: ExtraGroup })[] }[] = [
    {
      id: 'daily',
      title: t.groups.daily,
      entries: [
        {
          to: '/shopping',
          icon: ShoppingBasket,
          title: messages.pages.shopping,
          detail: t.shoppingDetail,
        },
        {
          to: '/check',
          icon: ClipboardCheck,
          title: messages.pages.check,
          detail: t.checkDetail(lastCheck === null ? null : daysBetween(lastCheck, today)),
          extra: 'routines',
        },
        {
          to: '/more/spots',
          icon: MapPin,
          title: messages.pages.spots,
          detail: t.spotsDetail,
          extra: 'spots',
        },
        {
          to: '/more/vacation',
          icon: Plane,
          title: t.vacationLabel,
          detail: t.vacationDetail,
          extra: 'routines',
        },
      ],
    },
    {
      id: 'balance',
      title: t.groups.balance,
      entries: [
        {
          to: '/more/history',
          icon: HistoryIcon,
          title: messages.pages.history,
          detail: t.historyDetail,
        },
        {
          to: '/more/climate',
          icon: Leaf,
          title: messages.pages.climate,
          detail: t.climateDetail,
          extra: 'insights',
        },
        {
          to: '/more/achievements',
          icon: Award,
          title: messages.pages.achievements,
          detail: t.achievementsDetail,
          extra: 'insights',
        },
        {
          to: '/more/reports',
          icon: FileChartColumn,
          title: messages.reports.title,
          detail: t.reportsDetail,
          extra: 'insights',
        },
      ],
    },
    {
      id: 'household',
      title: t.groups.household,
      entries: [
        {
          to: '/more/people',
          icon: Users,
          title: messages.pages.people,
          detail: t.peopleDetail,
          extra: 'household',
        },
        { to: '/more/data', icon: ShieldCheck, title: messages.pages.data, detail: t.dataDetail },
        {
          to: '/more/extras',
          icon: SlidersHorizontal,
          title: messages.pages.extras,
          detail: t.extrasDetail(extras.on),
        },
      ],
    },
  ];
  // Extras the person has not switched on stay out of the menu (ADR-0095); their pages still open.
  const shown = groups.map((group) => ({
    ...group,
    entries: group.entries.filter(
      (entry) => entry.extra === undefined || isShown(extras, entry.extra),
    ),
  }));
  return (
    <div className="space-y-6">
      <h1 className="large-title">{messages.pages.more}</h1>

      {isInstalled() ? null : (
        <Card variant="tip">
          <h2 className="flex items-center gap-2 font-semibold">
            <Smartphone size={20} aria-hidden="true" />
            {t.install}
          </h2>
          <p className="mt-1">{isIos() ? t.installIos : t.installOther}</p>
        </Card>
      )}

      {shown.map((group) => (
        <section key={group.id} aria-labelledby={`more-${group.id}`} className="space-y-2">
          <h2
            id={`more-${group.id}`}
            className="px-4 text-sm font-semibold text-ink-muted uppercase"
          >
            {group.title}
          </h2>
          <MenuList entries={group.entries} />
        </section>
      ))}
    </div>
  );
}
