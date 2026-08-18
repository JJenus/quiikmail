interface ApiErrorShape {
  data?: {
    message?: string
    details?: {
      formErrors?: string[]
      fieldErrors?: Record<string, string[]>
    }
  }
}

/** Extracts the API error message from a $fetch failure (our envelope: { statusCode, code, message, details }). */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const data = (error as ApiErrorShape)?.data
  const fieldErrors = data?.details?.fieldErrors
  if (fieldErrors) {
    const parts = Object.entries(fieldErrors).flatMap(([field, messages]) =>
      messages.map(m => `${field}: ${m}`)
    )
    if (parts.length) return parts.join(' · ')
  }
  return data?.message ?? fallback
}
