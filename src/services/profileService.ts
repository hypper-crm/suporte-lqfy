import { serviceErrors } from '../i18n/pt-BR'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'

const profileFields = 'id, full_name, created_at'

export async function getProfileById(profileId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(profileFields)
    .eq('id', profileId)
    .maybeSingle()
  if (error) throw new Error(serviceErrors.profileLoad)
  return data
}

export async function listProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select(profileFields).order('full_name', { ascending: true })
  if (error) throw new Error(serviceErrors.profilesLoad)
  return data
}
