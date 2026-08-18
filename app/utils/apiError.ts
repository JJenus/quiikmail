/** Extracts the API error message from a $fetch failure (our envelope: { statusCode, code, message, details }). */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const data = (error as { data?: { message?: string } })?.data
  return data?.message ?? fallback
}
