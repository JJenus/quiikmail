import type { ZodType } from 'zod'
import { z } from 'zod'
import type { H3Event } from 'h3'
import { appError } from './errors'

/**
 * Reads and validates the request body against a zod schema.
 * Throws 422 VALIDATION_ERROR with field details on mismatch.
 */
export async function readValidatedBody<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
  const body = await readBody(event)
  return validate(schema, body)
}

export async function readValidatedQuery<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
  const query = getQuery(event)
  return validate(schema, query)
}

function validate<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw appError(422, 'VALIDATION_ERROR', 'Invalid request', z.flattenError(result.error))
  }
  return result.data
}

export function ok<T>(event: H3Event, data: T) {
  return send(event, JSON.stringify(data), 'application/json')
}

export function created<T>(event: H3Event, data: T) {
  setResponseStatus(event, 201)
  return send(event, JSON.stringify(data), 'application/json')
}

export function noContent(event: H3Event) {
  setResponseStatus(event, 204)
  return null
}
