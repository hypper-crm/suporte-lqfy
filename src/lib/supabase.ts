import { createClient } from '@supabase/supabase-js'
import { appStart } from '../i18n/pt-BR'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const missingVariables = [
  !supabaseUrl && 'VITE_SUPABASE_URL',
  !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY',
].filter(Boolean)

if (missingVariables.length > 0) {
  throw new Error(appStart.missingEnvironmentVariables(missingVariables.join(', ')))
}

export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string)
