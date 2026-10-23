import { useCallback, useEffect, useMemo, useState } from 'react'
import { serviceErrors } from '../i18n/pt-BR'
import {
  areCardFormValuesEqual,
  sortAssigneeIds,
  toCardDetailsInput,
  toCardFormValues,
  validateCardTitle,
  type CardFormField,
  type CardFormValues,
} from '../lib/cardFormValues'
import type { CardDetailsInput, SavedCardDetails } from '../types/board'
import type { Card } from '../types/database'

export type CardDetailsFormState = {
  values: CardFormValues
  titleErrorMessage: string | undefined
  isDirty: boolean
  isSaving: boolean
  isSaved: boolean
  saveErrorMessage: string | null
  hasRemoteChanges: boolean
  updateValue: <Field extends CardFormField>(field: Field, value: CardFormValues[Field]) => void
  save: () => Promise<void>
  loadLatestVersion: () => void
}

// `card` and `assigneeIds` are live values from the board, kept up to date by realtime.
export function useCardDetailsForm(
  card: Card,
  assigneeIds: string[],
  onSave: (input: CardDetailsInput) => Promise<SavedCardDetails>,
): CardDetailsFormState {
  // The saved values the current edits started from.
  const [baseValues, setBaseValues] = useState(() => toCardFormValues({ card, assigneeIds }))
  const [values, setValues] = useState(baseValues)
  const [titleErrorMessage, setTitleErrorMessage] = useState<string | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null)
  const [hasRemoteChanges, setHasRemoteChanges] = useState(false)

  const liveValues = useMemo(() => toCardFormValues({ card, assigneeIds }), [card, assigneeIds])
  const isDirty = !areCardFormValuesEqual(values, baseValues)

  // Applies changes made elsewhere: silently when there are no unsaved edits, otherwise only flags them.
  useEffect(() => {
    // The echo of our own save is handled when the save finishes.
    if (isSaving || areCardFormValuesEqual(liveValues, baseValues)) return
    if (areCardFormValuesEqual(liveValues, values)) {
      setBaseValues(liveValues)
      setHasRemoteChanges(false)
    } else if (!isDirty) {
      setBaseValues(liveValues)
      setValues(liveValues)
      setHasRemoteChanges(false)
    } else {
      setHasRemoteChanges(true)
    }
  }, [liveValues, baseValues, values, isDirty, isSaving])

  const updateValue = useCallback(<Field extends CardFormField>(field: Field, value: CardFormValues[Field]) => {
    const nextValue = field === 'assigneeIds' ? sortAssigneeIds(value as string[]) : value
    setValues((current) => ({ ...current, [field]: nextValue }))
    setIsSaved(false)
    if (field === 'title') setTitleErrorMessage(undefined)
  }, [])

  const save = useCallback(async () => {
    const titleError = validateCardTitle(values.title)
    setTitleErrorMessage(titleError)
    if (titleError) return

    setIsSaving(true)
    setIsSaved(false)
    setSaveErrorMessage(null)
    try {
      const savedValues = toCardFormValues(await onSave(toCardDetailsInput(values)))
      setBaseValues(savedValues)
      setValues(savedValues)
      setHasRemoteChanges(false)
      setIsSaved(true)
    } catch (error) {
      setSaveErrorMessage(error instanceof Error ? error.message : serviceErrors.cardSave)
    } finally {
      setIsSaving(false)
    }
  }, [values, onSave])

  const loadLatestVersion = useCallback(() => {
    setBaseValues(liveValues)
    setValues(liveValues)
    setHasRemoteChanges(false)
    setTitleErrorMessage(undefined)
    setSaveErrorMessage(null)
  }, [liveValues])

  return {
    values,
    titleErrorMessage,
    isDirty,
    isSaving,
    isSaved,
    saveErrorMessage,
    hasRemoteChanges,
    updateValue,
    save,
    loadLatestVersion,
  }
}
