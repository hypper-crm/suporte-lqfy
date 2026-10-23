import { useEffect, useState, type FormEvent } from 'react'
import { common, deadlineSettings, serviceErrors } from '../../i18n/pt-BR'
import { checkOverdueAfterDays, maximumOverdueAfterDays, minimumOverdueAfterDays } from '../../lib/deadlineSettings'
import { Button } from '../ui/Button'
import { fieldErrorId } from '../ui/Field'
import { Input } from '../ui/Input'
import { StatusMessage } from '../ui/StatusMessage'

const fieldId = 'overdue-after-days'

const helpId = `${fieldId}-help`

type OverdueAfterDaysFormProps = {
  // The saved value, kept up to date by realtime.
  overdueAfterDays: number
  onSave: (overdueAfterDays: number) => Promise<void>
}

export function OverdueAfterDaysForm({ overdueAfterDays, onSave }: OverdueAfterDaysFormProps) {
  const [value, setValue] = useState(String(overdueAfterDays))
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  // The saved value the current edit started from.
  const [baseValue, setBaseValue] = useState(overdueAfterDays)

  const isDirty = value.trim() !== String(baseValue)

  // A value saved by someone else replaces the field, unless it has unsaved edits.
  useEffect(() => {
    if (overdueAfterDays === baseValue || isSaving) return
    setBaseValue(overdueAfterDays)
    if (!isDirty) setValue(String(overdueAfterDays))
  }, [overdueAfterDays, baseValue, isDirty, isSaving])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const check = checkOverdueAfterDays(value)
    if (!check.isValid) {
      setErrorMessage(check.errorMessage)
      return
    }

    setIsSaving(true)
    setIsSaved(false)
    setSaveErrorMessage(null)
    try {
      await onSave(check.days)
      setBaseValue(check.days)
      setValue(String(check.days))
      setIsSaved(true)
    } catch (error) {
      setSaveErrorMessage(error instanceof Error ? error.message : serviceErrors.teamSettingsSave)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form noValidate onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      <div className="sticky top-0 z-raised -mx-4 -mt-4 flex items-center justify-between gap-3 rounded-t-card border-b border-border bg-surface px-4 py-3">
        <h3 className="truncate text-sm font-semibold">{deadlineSettings.formTitle}</h3>
        <Button type="submit" variant="primary" disabled={isSaving || !isDirty}>
          {isSaving ? common.saving : common.save}
        </Button>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-xs font-medium text-muted">
          {deadlineSettings.overdueAfterDays}
        </label>
        <Input
          id={fieldId}
          type="number"
          inputMode="numeric"
          min={minimumOverdueAfterDays}
          max={maximumOverdueAfterDays}
          step={1}
          value={value}
          disabled={isSaving}
          hasError={Boolean(errorMessage)}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? `${helpId} ${fieldErrorId(fieldId)}` : helpId}
          onChange={(event) => {
            setValue(event.target.value)
            setErrorMessage(undefined)
            setIsSaved(false)
          }}
          className="max-w-40"
        />
        <p id={helpId} className="text-xs text-subtle">
          {deadlineSettings.overdueAfterDaysHelp}
        </p>
        {errorMessage && (
          <p id={fieldErrorId(fieldId)} className="text-xs text-danger">
            {errorMessage}
          </p>
        )}
      </div>
      {saveErrorMessage && <StatusMessage variant="error">{saveErrorMessage}</StatusMessage>}
      {isSaved && !isDirty && <StatusMessage variant="success">{common.saved}</StatusMessage>}
    </form>
  )
}
