import { useState, type FormEvent } from 'react'
import { useClientForm } from '../../hooks/useClientForm'
import { common, newImplementation, serviceErrors } from '../../i18n/pt-BR'
import { sortAssigneeIds } from '../../lib/cardFormValues'
import { toClientInput } from '../../lib/clientFormValidation'
import { AssigneesField } from '../../shared/cardDetails/CardFormFields'
import type { ClientCoverChange, ClientInput } from '../../types/client'
import type { Client, Profile } from '../../types/database'
import { ClientDetailFields, ClientMainFields, hasClientDetailErrors } from '../clients/ClientFields'
import { Button } from '../ui/Button'
import { CollapsibleSection } from '../ui/CollapsibleSection'
import { Drawer } from '../ui/Drawer'
import { Field } from '../ui/Field'
import { FormField } from '../ui/FormField'
import { Textarea } from '../ui/Input'
import { StatusMessage } from '../ui/StatusMessage'

// Lets the save button in the drawer header submit the form.
const newImplementationFormId = 'new-implementation-form'

// Values of the implementation card created for the new client.
export type NewImplementationCardFields = {
  clientId: string
  title: string
  startDate: string | null
  description: string | null
  assigneeIds: string[]
}

type NewImplementationDrawerProps = {
  profiles: Profile[]
  onCreateClient: (input: ClientInput, coverChange: ClientCoverChange) => Promise<Client>
  onCreateCard: (fields: NewImplementationCardFields) => Promise<void>
  onClose: () => void
}

// Creates a client and its implementation card together.
export function NewImplementationDrawer({ profiles, onCreateClient, onCreateCard, onClose }: NewImplementationDrawerProps) {
  const clientForm = useClientForm(null)
  const [startDate, setStartDate] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])
  // Set once the client exists, so trying again creates only the card.
  const [createdClient, setCreatedClient] = useState<Client | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null)

  async function createCard(client: Client) {
    try {
      await onCreateCard({
        clientId: client.id,
        title: client.name,
        startDate: startDate || null,
        description: description.trim() || null,
        assigneeIds,
      })
      onClose()
    } catch {
      setSaveErrorMessage(newImplementation.cardNotCreated)
      setIsSaving(false)
    }
  }

  async function save() {
    if (createdClient) {
      setIsSaving(true)
      setSaveErrorMessage(null)
      await createCard(createdClient)
      return
    }

    if (!clientForm.validate()) return
    setIsSaving(true)
    setSaveErrorMessage(null)
    let client: Client
    try {
      client = await onCreateClient(toClientInput(clientForm.values), clientForm.coverChange)
    } catch (error) {
      setSaveErrorMessage(error instanceof Error ? error.message : serviceErrors.clientCreate)
      setIsSaving(false)
      return
    }
    setCreatedClient(client)
    await createCard(client)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void save()
  }

  // The client fields are locked once the client was created.
  const isClientLocked = isSaving || createdClient !== null

  return (
    <Drawer
      title={newImplementation.title}
      onClose={onClose}
      headerAction={
        <Button type="submit" form={newImplementationFormId} variant="primary" disabled={isSaving}>
          {isSaving ? common.saving : common.save}
        </Button>
      }
    >
      <form id={newImplementationFormId} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ClientMainFields form={clientForm} disabled={isClientLocked} nameLabel={newImplementation.clientName} />
        <FormField
          id="new-implementation-start-date"
          label={newImplementation.startDate}
          type="date"
          lang="pt-BR"
          value={startDate}
          disabled={isSaving}
          onChange={(event) => setStartDate(event.target.value)}
        />
        <AssigneesField
          id="new-implementation-assignees"
          assigneeIds={assigneeIds}
          profiles={profiles}
          disabled={isSaving}
          onChange={(ids) => setAssigneeIds(sortAssigneeIds(ids))}
        />
        <CollapsibleSection title={newImplementation.moreDetails} isForcedOpen={hasClientDetailErrors(clientForm)}>
          <ClientDetailFields form={clientForm} disabled={isClientLocked} savedCoverUrl={null} />
          <Field id="new-implementation-description" label={newImplementation.description}>
            <Textarea
              id="new-implementation-description"
              rows={5}
              value={description}
              disabled={isSaving}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
        </CollapsibleSection>

        {saveErrorMessage && (
          <div className="flex flex-col items-start gap-2">
            <StatusMessage variant="error">{saveErrorMessage}</StatusMessage>
            {createdClient && (
              <Button variant="link" disabled={isSaving} onClick={() => void save()}>
                {common.tryAgain}
              </Button>
            )}
          </div>
        )}
      </form>
    </Drawer>
  )
}
