import {
  chainCatalogs,
  createRecipeCommands,
  createRecipeQueries,
  createShoppingUseCases,
  householdCurrency,
  type CurrencyCode,
  type Id,
  type IdGenerator,
  type LocalDate,
  type RecipeCommands,
  type RecipeQueries,
  type ShoppingUseCases,
} from '@fridgeai/core';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { browserClock, browserIds } from '../data/adapters';
import { ensureLocalHousehold } from '../data/bootstrap';
import { startWithEssentials } from './extras';
import { openFoodFactsAllowed, startWithoutOpenFoodFacts } from './open-food-facts-setting';
import { appContext } from '../data/command';
import { FridgeDb } from '../data/db';
import { createInventoryHandlers, type InventoryHandlers } from '../data/handlers';
import { createHouseholdHandlers, type HouseholdHandlers } from '../data/household-handlers';
import { cachedCatalog } from '../data/catalog-cache';
import {
  gatedCatalog,
  gatedSearch,
  openFoodFactsCatalog,
  openFoodFactsSearch,
  rateLimitedSearch,
} from '../data/open-food-facts';
import { shippedCatalog } from '../data/local-catalog';
import { requestPersistentStorage } from '../data/persistence';
import { fetchProductImage } from '../data/product-images';
import { messages } from './messages.de-CH';

export interface AppData {
  db: FridgeDb;
  householdId: Id;
  /** The household's name as stored (the default until it is renamed or imported). */
  householdName: string;
  memberId: Id;
  ids: IdGenerator;
  /** Household currency (ADR-0019); amounts are integers in its smallest unit. */
  currency: CurrencyCode;
  /** Swiss calendar day when the app was opened; refreshed when the app becomes visible again. */
  today: LocalDate;
  inventory: InventoryHandlers;
  shopping: ShoppingUseCases;
  household: HouseholdHandlers;
  recipes: RecipeQueries;
  recipeCommands: RecipeCommands;
}

const AppDataContext = createContext<AppData | null>(null);

let defaultDb: FridgeDb | undefined;

/**
 * Opens the local database, makes sure a local household exists (US-15) and provides the contract
 * handlers to the UI. Pages never touch Dexie directly (ADR-0005).
 */
export function AppDataProvider({ children, db }: { children: ReactNode; db?: FridgeDb }) {
  const [data, setData] = useState<AppData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const database = db ?? (defaultDb ??= new FridgeDb());
    let cancelled = false;
    ensureLocalHousehold(database, browserClock, browserIds, {
      household: messages.defaults.householdName,
      member: messages.defaults.memberName,
    })
      .then((profile) => {
        // Local-first: ask the browser not to clear the data when space runs low.
        void requestPersistentStorage('storage' in navigator ? navigator.storage : undefined);
        // A new person starts with the essentials (ADR-0095); before the cancel check, because
        // only the first of two effect runs creates the household.
        if (profile.created) {
          startWithEssentials();
          startWithoutOpenFoodFacts();
        }
        if (cancelled) {
          return;
        }
        const shipped = shippedCatalog();
        const context = {
          db: database,
          clock: browserClock,
          ids: browserIds,
          actor: profile.member.id,
          // Open Food Facts only while its switch is on (ADR-0096), the cache answers either way;
          // then the shipped catalog, on the device and outside the cache.
          catalog: chainCatalogs([
            cachedCatalog(
              database,
              gatedCatalog(openFoodFactsCatalog(), openFoodFactsAllowed),
              browserClock,
              {
                image: (url) =>
                  openFoodFactsAllowed() ? fetchProductImage(url) : Promise.resolve(null),
              },
            ),
            shipped.lookup,
          ]),
          search: gatedSearch(rateLimitedSearch(openFoodFactsSearch()), openFoodFactsAllowed),
          localSearch: shipped.search,
        };
        const inventory = createInventoryHandlers(context);
        // Items that once landed in «Sonstiges» move to their category as soon as the
        // recognition knows them; only what nobody touched (ADR-0045). Quiet on failure.
        void inventory['inventory.recategorize']({
          commandId: browserIds.next(),
          householdId: profile.household.id,
        }).catch(() => undefined);
        setData({
          db: database,
          householdId: profile.household.id,
          householdName: profile.household.name,
          memberId: profile.member.id,
          ids: browserIds,
          currency: householdCurrency(profile.household),
          today: browserClock.today(),
          inventory,
          shopping: createShoppingUseCases(appContext(context)),
          household: createHouseholdHandlers(context),
          recipes: createRecipeQueries(appContext(context)),
          recipeCommands: createRecipeCommands(appContext(context)),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [db]);

  // A new day starts while the app is open in the background: refresh «today».
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        setData((current) => {
          const today = browserClock.today();
          return current === null || current.today === today ? current : { ...current, today };
        });
      }
    };
    document.addEventListener('visibilitychange', refresh);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  if (failed) {
    return <p className="p-6 text-today">{messages.errors.storage}</p>;
  }
  if (data === null) {
    return <p className="sr-only">{messages.loading}</p>;
  }
  return <AppDataContext.Provider value={data}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const data = useContext(AppDataContext);
  if (data === null) {
    throw new Error('useAppData must be used inside <AppDataProvider>');
  }
  return data;
}
