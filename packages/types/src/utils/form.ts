/**
 * Normalize an optional field value for InstantDB create/update payloads.
 *
 * - `null`, `undefined`, `""` → treated as "empty" (user cleared the field)
 *   - On update: returns `null` so the backend clears the field
 *   - On create: returns `undefined` so the field is omitted
 * - `0`, `false`, and any other value → kept as-is (valid data)
 *
 * Use this for ALL optional fields (strings, numbers, dates, json) in admin forms.
 * Accepts broad input types so callers don't need explicit casts from form values.
 */
export function orEmpty<T>(val: T, isUpdate: boolean): NonNullable<T> | null | undefined {
  if (val == null || val === '') return isUpdate ? null : undefined
  return val
}
