export const NETWORK_WARNING_MESSAGE =
  'Votre connexion internet semble instable. Le site peut être lent ou certaines données peuvent ne pas se charger immédiatement.';

export const OFFLINE_WARNING_MESSAGE =
  'Vous êtes hors ligne. Certaines données peuvent ne pas se charger tant que votre connexion est rétablie.';

export function getNetworkWarningMessage(isOffline = false): string {
  return isOffline ? OFFLINE_WARNING_MESSAGE : NETWORK_WARNING_MESSAGE;
}

export function dispatchNetworkIssue(isOffline = false): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  window.dispatchEvent(new CustomEvent('app:network-issue', { detail: { isOffline } }));
  return true;
}
