import { createClient } from '@supabase/supabase-js'
import { env } from './env'
import type { Database } from '../types/database'

/**
 * Cliente único para toda la app. `Database` se genera desde el esquema real con:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */
export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
