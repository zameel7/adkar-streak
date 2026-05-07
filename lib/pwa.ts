import { Platform } from 'react-native';

export function isPWA(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof window === 'undefined') return false;
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches;
  const iosStandalone = (window.navigator as any)?.standalone === true;
  return Boolean(standalone || iosStandalone);
}
