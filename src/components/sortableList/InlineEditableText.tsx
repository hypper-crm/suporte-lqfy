import { useState, type KeyboardEvent } from 'react'
import { common } from '../../i18n/pt-BR'
import { Input } from '../ui/Input'

type InlineEditableTextProps = {
  value: string
  // Label of the text button that starts editing, and of the input while editing.
  renameLabel: string
  editLabel: string
  emptyErrorMessage: string
  maximumLength: number
  textClassName?: string
  onSave: (value: string) => Promise<void>
}

// Click the text to edit it. Enter saves, Escape cancels.
export function InlineEditableText({
  value,
  renameLabel,
  editLabel,
  emptyErrorMessage,
  maximumLength,
  textClassName = '',
  onSave,
}: InlineEditableTextProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function cancel() {
    setDraft(null)
    setErrorMessage(null)
  }

  async function save(nextValue: string) {
    const trimmedValue = nextValue.trim()
    if (!trimmedValue) {
      setErrorMessage(emptyErrorMessage)
      return
    }
    if (trimmedValue === value) {
      cancel()
      return
    }

    setIsSaving(true)
    setErrorMessage(null)
    try {
      await onSave(trimmedValue)
      setDraft(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : common.unknownError)
    } finally {
      setIsSaving(false)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (draft !== null) void save(draft)
    } else if (event.key === 'Escape') {
      // Marks the event as handled, so an enclosing drawer stays open.
      event.preventDefault()
      cancel()
    }
  }

  if (draft === null) {
    return (
      <button
        type="button"
        aria-label={renameLabel}
        onClick={() => setDraft(value)}
        className={`min-w-0 flex-1 rounded-md px-1.5 py-1 text-left text-sm break-words outline-none transition-colors duration-200 ease-fluid hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent/40 ${textClassName}`}
      >
        {value}
      </button>
    )
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <Input
        autoFocus
        aria-label={editLabel}
        maxLength={maximumLength}
        value={draft}
        disabled={isSaving}
        hasError={errorMessage !== null}
        className="h-8"
        onChange={(event) => {
          setDraft(event.target.value)
          setErrorMessage(null)
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!isSaving && errorMessage === null) cancel()
        }}
      />
      {errorMessage && (
        <p role="alert" className="text-xs text-danger">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
