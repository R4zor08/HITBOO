/** Dev-only structured logs for match flow (no-op in production build). */
export function logMatchDebug(
  event: string,
  payload?: Record<string, unknown>
): void {
  if (!import.meta.env.DEV) return;
  // eslint-disable-next-line no-console
  console.debug(`[HitBow:${event}]`, payload ?? '');
}
