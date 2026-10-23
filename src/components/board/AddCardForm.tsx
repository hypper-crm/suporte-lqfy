import { Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { boards, common, serviceErrors } from '../../i18n/pt-BR'
import { maximumCardTitleLength } from '../../lib/cardFormValues'
import type { Client } from '../../types/database'
import { Button } from '../ui/Button'
import { Input, Select } from '../ui/Input'
import { StatusMessage } from '../ui/StatusMessage'

type AddCardFormProps = {
  clients: Client[]
  onCreate: (title: string, clientId: string | null) => Promise<void>
}

export function AddCardForm({ clients, onCreate }: AddCardFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function close() {
    setIsOpen(false)
    setTitle('')
    setClientId('')
    setErrorMessage(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setErrorMessage(boards.addCard.titleRequired)
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await onCreate(trimmedTitle, clientId || null)
      setTitle('')
      setClientId('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : serviceErrors.cardCreate)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-full items-center gap-2 rounded-card px-2.5 text-left text-sm font-medium text-muted outline-none transition-colors duration-200 ease-fluid hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <Plus aria-hidden="true" className="size-4" />
        {boards.addCard.open}
      </button>
    )
  }

  return (
    <motion.form
      noValidate
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2 rounded-card border border-border-strong bg-elevated p-2"
    >
      <Input
        autoFocus
        aria-label={boards.addCard.titleLabel}
        placeholder={boards.addCard.titleLabel}
        maxLength={maximumCardTitleLength}
        value={title}
        disabled={isSubmitting}
        onChange={(event) => {
          setTitle(event.target.value)
          setErrorMessage(null)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') close()
        }}
      />
      <Select aria-label={boards.addCard.clientLabel} value={clientId} disabled={isSubmitting} onChange={(event) => setClientId(event.target.value)}>
        <option value="">{boards.addCard.noClient}</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </Select>
      {errorMessage && <StatusMessage variant="error">{errorMessage}</StatusMessage>}
      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary" size="small" disabled={isSubmitting}>
          {isSubmitting ? boards.addCard.submitting : boards.addCard.submit}
        </Button>
        <Button variant="ghost" size="small" onClick={close} disabled={isSubmitting}>
          {common.cancel}
        </Button>
      </div>
    </motion.form>
  )
}
