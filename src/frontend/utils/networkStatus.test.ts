import { describe, expect, it } from 'vitest';
import { getNetworkWarningMessage } from './networkStatus';

describe('getNetworkWarningMessage', () => {
  it('returns the offline message when the browser is offline', () => {
    const message = getNetworkWarningMessage(true);
    expect(message).toContain('hors ligne');
  });

  it('returns the instability message by default', () => {
    const message = getNetworkWarningMessage();
    expect(message).toContain('instable');
  });
});
