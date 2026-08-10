// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { fetchEntityDataFromApi } from './firestoreEntityService';

describe('fetchEntityDataFromApi', () => {
  it('returns null when the request is aborted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('The operation was aborted.', 'AbortError'))
    );

    await expect(fetchEntityDataFromApi('product')).resolves.toBeNull();
  });
});
