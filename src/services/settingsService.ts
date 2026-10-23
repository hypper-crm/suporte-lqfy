import { serviceErrors } from '../i18n/pt-BR'
import { supabase } from '../lib/supabase'
import type { RealtimeHandlers } from '../types/board'
import type { TeamSettings } from '../types/database'
import { subscribeToTableChanges } from './realtimeChannel'

// The team settings live in a single row.
const teamSettingsId = 1

const teamSettingsFields = 'id, overdue_after_days'

export const defaultOverdueAfterDays = 7

function toTeamSettings(record: Record<string, unknown>): TeamSettings {
  const overdueAfterDays = Number(record.overdue_after_days)
  return {
    id: Number(record.id),
    overdue_after_days: Number.isInteger(overdueAfterDays) && overdueAfterDays > 0 ? overdueAfterDays : defaultOverdueAfterDays,
  }
}

// Falls back to the default settings when the row does not exist.
export async function fetchTeamSettings(): Promise<TeamSettings> {
  const { data, error } = await supabase.from('team_settings').select(teamSettingsFields).eq('id', teamSettingsId).maybeSingle()
  if (error) throw new Error(serviceErrors.teamSettingsLoad)
  return data ? toTeamSettings(data) : { id: teamSettingsId, overdue_after_days: defaultOverdueAfterDays }
}

export async function updateOverdueAfterDays(overdueAfterDays: number): Promise<TeamSettings> {
  const { data, error } = await supabase
    .from('team_settings')
    .update({ overdue_after_days: overdueAfterDays })
    .eq('id', teamSettingsId)
    .select(teamSettingsFields)
    .maybeSingle()
  if (error) throw new Error(serviceErrors.teamSettingsSave)
  // An update blocked by row level security or on a missing row returns no row instead of an error.
  if (!data) throw new Error(serviceErrors.teamSettingsSaveMissing)
  return toTeamSettings(data)
}

export function subscribeToTeamSettingsChanges(handlers: RealtimeHandlers<TeamSettings>): () => void {
  return subscribeToTableChanges({
    table: 'team_settings',
    filter: `id=eq.${teamSettingsId}`,
    toRow: toTeamSettings,
    handlers,
  })
}
