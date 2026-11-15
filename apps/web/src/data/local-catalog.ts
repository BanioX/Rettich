import {
  localCatalogSearch,
  parseCatalogFile,
  type CatalogProduct,
  type ProductCatalog,
  type ProductSearch,
} from '@fridgeai/core';

/** The catalog file built from Open Food Facts (ADR-0045), served with the app, never a CDN. */
export const CATALOG_URL = `${import.meta.env.BASE_URL}catalog/off-ch.json`;

type Load = () => Promise<Response>;

/**
 * The shipped catalog on the device: a name search and a barcode lookup over the same file. The
 * file (about 210 kB packed) is fetched on first use only and then kept in memory; the service
 * worker keeps it for offline use. When it cannot be loaded, the search says `unavailable`, the
 * lookup knows nothing, and both try again next time.
 */
export function shippedCatalog(load: Load = () => fetch(CATALOG_URL, { credentials: 'omit' })): {
  search: ProductSearch;
  lookup: ProductCatalog;
} {
  let ready: Promise<CatalogProduct[] | null> | undefined;
  let search: ProductSearch | undefined;
  async function products() {
    ready ??= load()
      .then((response) => (response.ok ? response.json() : null))
      .then((json: unknown) => (json === null ? null : parseCatalogFile(json)))
      .catch(() => null);
    const found = await ready;
    if (found === null) {
      ready = undefined;
    }
    return found;
  }
  return {
    search: {
      async searchByName(query, limit) {
        const all = await products();
        if (all === null) {
          return 'unavailable';
        }
        search ??= localCatalogSearch(all);
        return search.searchByName(query, limit);
      },
    },
    // A scan finds Swiss products without Open Food Facts too (ADR-0096).
    lookup: {
      async lookupByGtin(gtin) {
        const product = (await products())?.find((entry) => entry.gtin === gtin);
        return product === undefined
          ? null
          : {
              gtin,
              name: product.name,
              ...(product.brand === undefined ? {} : { brand: product.brand }),
              ...(product.packSize === undefined ? {} : { packSize: product.packSize }),
              categoryHints: [...product.hints],
              source: 'off',
            };
      },
    },
  };
}

/** The name search alone, as before. */
export function shippedCatalogSearch(load?: Load): ProductSearch {
  return shippedCatalog(load).search;
}
