/**
 * Extracts a user-facing message from a failed API call. Prefers the
 * field-level details the backend's validation middleware attaches
 * (err.error.errors — see src/middleware/validation.middleware.ts), so a
 * generic "Validation failed" toast becomes something like "password:
 * Password must contain at least one uppercase letter" instead of a
 * dead end. Falls back to the top-level message, then to the caller's
 * default.
 */
export function getApiErrorMessage(err: any, fallback: string): string {
  const errors = err?.error?.errors;
  if (Array.isArray(errors) && errors.length) {
    return errors
      .map((e: { field?: string; message: string }) =>
        e.field ? `${e.field}: ${e.message}` : e.message,
      )
      .join(' • ');
  }
  return err?.error?.message || fallback;
}