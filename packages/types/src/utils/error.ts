/**
 * Extracts the error message from an Axios error response.
 * The API returns translation keys (e.g. "auth.noAccountPhone").
 * If a translate function is provided, tries to resolve the key;
 * otherwise falls back to the provided fallback string.
 */
export function getApiErrorMessage(
  err: unknown,
  fallback: string,
  t?: (key: string) => string
): string {
  const axiosErr = err as { response?: { data?: { message?: string } } }
  const message = axiosErr?.response?.data?.message
  if (!message) return fallback
  if (t) {
    const translated = t(message)
    // If the translation function returns the key itself, it means no translation found
    return translated !== message ? translated : fallback
  }
  return fallback
}
