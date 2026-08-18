import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../schemas'
import { getEnvConfig } from '../config/env'

let db: ReturnType<typeof createDb> | null = null
let sql: postgres.Sql | null = null

/**
 * Singleton Postgres + Drizzle connection.
 * Configured via NUXT_MAIL_DATABASE_URL (validated in config/env.ts).
 */
function createDb() {
  const { databaseUrl } = getEnvConfig()
  sql = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 15
  })
  return drizzle(sql, { schema })
}

export function getDatabase() {
  if (!db) db = createDb()
  return db
}

export function getSql() {
  if (!sql) sql = postgres(getEnvConfig().databaseUrl, { max: 10 })
  return sql
}

export type Database = ReturnType<typeof getDatabase>
