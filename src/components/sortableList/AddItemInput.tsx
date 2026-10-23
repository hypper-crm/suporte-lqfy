import { Plus } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { common } from '../../i18n/pt-BR'

type AddItemInputProps = {
  label: string
  placeholder: string
  emptyErrorMessage: string
  maximumLength: number
  onAdd: (title: string) => Promise<void>
}

// Type a title and press Enter to add it. Escape clears the input.
export function AddItemInput({ label, placeholder, emptyErrorMessage, maximumLength, onAdd }: AddItemInputProps) {
  const [title, setTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function add() {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setErrorMessage(emptyErrorMessage)
      return
    }

    setIsAdding(true)
    setErrorMessage(null)
    try {
      await onAdd(trimmedTitle)
      setTitle('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : common.unknownError)
    } finally {
      setIsAdding(false)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (!isAdding) void add()
    } else if (event.key === 'Escape' && title) {
      // Marks the event as handled, so an enclosing drawer stays open.
      event.preventDefault()
      setTitle('')
      setErrorMessage(null)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`flex h-10 items-center gap-2 rounded-card border border-dashed bg-background/40 px-3 transition-[border-color,box-shadow] duration-200 ease-fluid focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/15 ${
          errorMessage ? 'border-danger/70' : 'border-border-strong hover:border-muted/50'
        }`}
      >
        <Plus aria-hidden="true" className="size-4 shrink-0 text-muted" />
        <input
          aria-label={label}
          placeholder={placeholder}
          maxLength={maximumLength}
          value={title}
          readOnly={isAdding}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-subtle"
          onChange={(event) => {
            setTitle(event.target.value)
            setErrorMessage(null)
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
      {errorMessage && (
        <p role="alert" className="text-xs text-danger">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
