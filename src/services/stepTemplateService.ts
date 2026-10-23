import { serviceErrors } from '../i18n/pt-BR'
import { supabase } from '../lib/supabase'
import type { StepTemplateRealtimeHandlers } from '../types/checklist'
import type { ImplementationStepTemplate } from '../types/database'
import { subscribeToTableChanges } from './realtimeChannel'

const stepTemplateFields = 'id, title, position'

function toStepTemplate(record: Record<string, unknown>): ImplementationStepTemplate {
  return {
    id: String(record.id),
    title: String(record.title ?? ''),
    position: Number(record.position),
  }
}

export async function listStepTemplates(): Promise<ImplementationStepTemplate[]> {
  const { data, error } = await supabase
    .from('implementation_step_templates')
    .select(stepTemplateFields)
    .order('position', { ascending: true })
  if (error) throw new Error(serviceErrors.stepsLoad)
  return data.map(toStepTemplate)
}

export async function createStepTemplate(title: string, position: number): Promise<ImplementationStepTemplate> {
  const { data, error } = await supabase
    .from('implementation_step_templates')
    .insert({ title, position })
    .select(stepTemplateFields)
    .single()
  if (error) throw new Error(serviceErrors.stepCreate)
  return toStepTemplate(data)
}

async function updateStepTemplate(
  stepTemplateId: string,
  values: { title?: string; position?: number },
): Promise<ImplementationStepTemplate> {
  const { data, error } = await supabase
    .from('implementation_step_templates')
    .update(values)
    .eq('id', stepTemplateId)
    .select(stepTemplateFields)
    .maybeSingle()
  if (error) throw new Error(serviceErrors.stepSave)
  // An update blocked by row level security or on a deleted row returns no row instead of an error.
  if (!data) throw new Error(serviceErrors.stepSaveMissing)
  return toStepTemplate(data)
}

export function renameStepTemplate(stepTemplateId: string, title: string): Promise<ImplementationStepTemplate> {
  return updateStepTemplate(stepTemplateId, { title })
}

export function moveStepTemplate(stepTemplateId: string, position: number): Promise<ImplementationStepTemplate> {
  return updateStepTemplate(stepTemplateId, { position })
}

export async function deleteStepTemplate(stepTemplateId: string): Promise<void> {
  const { data, error } = await supabase.from('implementation_step_templates').delete().eq('id', stepTemplateId).select('id')
  if (error) throw new Error(serviceErrors.stepDelete)
  if (data.length === 0) throw new Error(serviceErrors.stepDeleteMissing)
}

export function subscribeToStepTemplateChanges(handlers: StepTemplateRealtimeHandlers): () => void {
  return subscribeToTableChanges({ table: 'implementation_step_templates', toRow: toStepTemplate, handlers })
}
