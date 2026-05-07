export function isPWA(): boolean {
  if (typeof window === 'undefined') return false
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return Boolean(standalone || iosStandalone)
}
