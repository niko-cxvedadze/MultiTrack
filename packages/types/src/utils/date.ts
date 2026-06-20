/**
 * Formats a Unix timestamp (ms) into a human-readable date string.
 * Example output: "Mar 27, 2026"
 */
export function formatDate(timestamp: number, locale?: string): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
