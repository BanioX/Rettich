import { GtinSchema } from '@fridgeai/core';
import { describe, expect, it, vi } from 'vitest';
import { shippedCatalog, shippedCatalogSearch } from './local-catalog';

const file = {
  products: [['7610200000019', 'Vollmilch UHT', 'M-Budget', '1 l', ['milks'], ['migros']]],
};

describe('shippedCatalogSearch (ADR-0045)', () => {
  it('loads the catalog once, on the first search', async () => {
    const load = vi.fn(() => Promise.resolve(Response.json(file)));
    const search = shippedCatalogSearch(load);
    expect(load).not.toHaveBeenCalled();
    expect(await search.searchByName('Vollmilch', 5)).toHaveLength(1);
    expect(await search.searchByName('UHT', 5)).toHaveLength(1);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('says unavailable when the file cannot be loaded and tries again next time', async () => {
    const load = vi
      .fn<() => Promise<Response>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(new Response('nope', { status: 404 }))
      .mockResolvedValueOnce(Response.json(file));
    const search = shippedCatalogSearch(load);
    expect(await search.searchByName('Vollmilch', 5)).toBe('unavailable');
    expect(await search.searchByName('Vollmilch', 5)).toBe('unavailable');
    expect(await search.searchByName('Vollmilch', 5)).toHaveLength(1);
    expect(load).toHaveBeenCalledTimes(3);
  });
});

describe('shippedCatalog lookup (ADR-0096)', () => {
  it('knows a barcode from the shipped file, shares one load with the search', async () => {
    const load = vi.fn(() => Promise.resolve(Response.json(file)));
    const catalog = shippedCatalog(load);
    const gtin = GtinSchema.parse('7610200000019');
    expect(await catalog.lookup.lookupByGtin(gtin)).toMatchObject({
      gtin,
      name: 'Vollmilch UHT',
      brand: 'M-Budget',
      packSize: '1 l',
      categoryHints: ['milks'],
    });
    expect(await catalog.lookup.lookupByGtin(GtinSchema.parse('7610200000026'))).toBeNull();
    expect(await catalog.search.searchByName('Vollmilch', 5)).toHaveLength(1);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
