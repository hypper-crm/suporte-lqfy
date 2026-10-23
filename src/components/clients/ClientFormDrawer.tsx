import { useState, type FormEvent } from 'react'
import { useClientForm } from '../../hooks/useClientForm'
import { clients as clientStrings, common, serviceErrors } from '../../i18n/pt-BR'
import { toClientInput } from '../../lib/clientFormValidation'
import type { ClientCoverChange, ClientInput } from '../../types/client'
import type { Client } from '../../types/database'
import { Button } from '../ui/Button'
import { Drawer } from '../ui/Drawer'
import { StatusMessage } from '../ui/StatusMessage'
import { ClientDetailFields, ClientMainFields } from './ClientFields'
import { DeleteClientConfirmation } from './DeleteClientConfirmation'

// Lets the save button in the drawer header submit the form.
const clientFormId = 'client-form'

type ClientFormDrawerProps = {
  // Null opens the form in create mode.
  client: Client | null
  onSave: (input: ClientInput, coverChange: ClientCoverChange) => Promise<unknown>
  // Only given in edit mode.
  onDelete?: () => Promise<void>
  onClose: () => void
}

export function ClientFormDrawer({ client, onSave, onDelete, onClose }: ClientFormDrawerProps) {
  const form = useClientForm(client)
  const [isSaving, setIsSaving] = useState(false)
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const isEditMode = client !== null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.validate()) return

    setIsSaving(true)
    setSaveErrorMessage(null)
    try {
      await onSave(toClientInput(form.values), form.coverChange)
      onClose()
    } catch (error) {
      setSaveErrorMessage(error instanceof Error ? error.message : serviceErrors.clientSave)
      setIsSaving(false)
    }
  }

  const isBusy = isSaving || isConfirmingDelete

  return (
    <Drawer
      title={isEditMode ? clientStrings.form.editTitle : clientStrings.form.createTitle}
      description={isEditMode ? client.name : clientStrings.form.createDescription}
      onClose={onClose}
      headerAction={
        <Button type="submit" form={clientFormId} variant="primary" disabled={isBusy}>
          {isSaving ? common.saving : common.save}
        </Button>
      }
    >
      <form id={clientFormId} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ClientMainFields form={form} disabled={isBusy} />
        <ClientDetailFields form={form} disabled={isBusy} savedCoverUrl={client?.cover_image_url ?? null} />

        {saveErrorMessage && <StatusMessage variant="error">{saveErrorMessage}</StatusMessage>}

        {/* The save and close buttons sit in the drawer header. */}
        {isEditMode &&
          onDelete &&
          (isConfirmingDelete ? (
            <DeleteClientConfirmation clientName={client.name} onConfirm={onDelete} onCancel={() => setIsConfirmingDelete(false)} />
          ) : (
            <Button variant="dangerGhost" onClick={() => setIsConfirmingDelete(true)} disabled={isSaving} className="self-start">
              {common.delete}
            </Button>
          ))}
      </form>
    </Drawer>
  )
}
