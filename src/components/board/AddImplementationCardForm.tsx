import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { boards, common, serviceErrors } from '../../i18n/pt-BR'
import { maximumCardTitleLength } from '../../lib/cardFormValues'
import type { ClientCoverChange, ClientInput } from '../../types/client'
import type { Client } from '../../types/database'
import { ClientFormDrawer } from '../clients/ClientFormDrawer'
import { Button } from '../ui/Button'
import { Input, Select } from '../ui/Input'
import { StatusMessage } from '../ui/StatusMessage'
import { AddCardOpenButton } from './AddCardOpenButton'

// Select value of the "+ Adicionar cliente" option. It is never stored as the selected client.
const addClientOptionValue = '__add_client__'

type AddImplementationCardFormProps = {
  clients: Client[]
  // The title is never empty: it falls back to the client's name.
  onCreate: (title: string, clientId: string) => Promise<void>
  onCreateClient: (input: ClientInput, coverChange: ClientCoverChange) => Promise<Client>
}

// The client comes first and is required. The title is optional.
export function AddImplementationCardForm({ clients, onCreate, onCreateClient }: AddImplementationCardFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [isClientFormOpen, setIsClientFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function close() {
    setIsOpen(false)
    setClientId('')
    setTitle('')
    setErrorMessage(null)
  }

  async function createClientAndSelect(input: ClientInput, coverChange: ClientCoverChange) {
    const createdClient = await onCreateClient(input, coverChange)
    setClientId(createdClient.id)
    setErrorMessage(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const client = clients.find((current) => current.id === clientId)
    if (!client) {
      setErrorMessage(boards.addCard.clientRequired)
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await onCreate(title.trim() || client.name, client.id)
      setClientId('')
      setTitle('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : serviceErrors.cardCreate)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return <AddCardOpenButton onClick={() => setIsOpen(true)} />

  return (
    <>
      <motion.form
        noValidate
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 rounded-card border border-border-strong bg-elevated p-2"
      >
        <Select
          autoFocus
          required
          aria-label={boards.addCard.clientLabel}
          value={clientId}
          disabled={isSubmitting}
          onChange={(event) => {
            if (event.target.value === addClientOptionValue) {
              setIsClientFormOpen(true)
              return
            }
            setClientId(event.target.value)
            setErrorMessage(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') close()
          }}
        >
          {/* Not listed, so the add option stays first and can be chosen even when it is the only one. */}
          <option value="" disabled hidden>
            {boards.addCard.selectClient}
          </option>
          <option value={addClientOptionValue}>{boards.addCard.addClient}</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
        <Input
          aria-label={boards.addCard.optionalTitleLabel}
          placeholder={boards.addCard.optionalTitleLabel}
          maxLength={maximumCardTitleLength}
          value={title}
          disabled={isSubmitting}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') close()
          }}
        />
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
      {/* Rendered at the body, so the drawer covers the screen above the card form instead of being placed inside the column. */}
      {createPortal(
        <AnimatePresence>
          {isClientFormOpen && (
            <ClientFormDrawer key="create-client" client={null} onSave={createClientAndSelect} onClose={() => setIsClientFormOpen(false)} />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
