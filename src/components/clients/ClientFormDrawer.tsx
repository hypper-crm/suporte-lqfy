import { useState, type FormEvent } from 'react'
import { clients as clientStrings, common, serviceErrors } from '../../i18n/pt-BR'
import {
  emptyClientFormValues,
  maximumClientNameLength,
  toClientFormValues,
  toClientInput,
  validateClientForm,
  type ClientFormErrors,
  type ClientFormValues,
} from '../../lib/clientFormValidation'
import type { ClientCoverChange, ClientInput } from '../../types/client'
import type { Client } from '../../types/database'
import { Button } from '../ui/Button'
import { Drawer } from '../ui/Drawer'
import { FormField } from '../ui/FormField'
import { StatusMessage } from '../ui/StatusMessage'
import { ClientCoverField } from './ClientCoverField'
import { DeleteClientConfirmation } from './DeleteClientConfirmation'

// Lets the save button in the drawer header submit the form.
const clientFormId = 'client-form'

type ClientFormDrawerProps = {
  // Null opens the form in create mode.
  client: Client | null
  onSave: (input: ClientInput, coverChange: ClientCoverChange) => Promise<void>
  // Only given in edit mode.
  onDelete?: () => Promise<void>
  onClose: () => void
}

export function ClientFormDrawer({ client, onSave, onDelete, onClose }: ClientFormDrawerProps) {
  const [values, setValues] = useState<ClientFormValues>(client ? toClientFormValues(client) : emptyClientFormValues)
  const [coverChange, setCoverChange] = useState<ClientCoverChange>({ kind: 'keep' })
  const [fieldErrors, setFieldErrors] = useState<ClientFormErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const isEditMode = client !== null

  function updateValue(field: keyof ClientFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validateClientForm(values)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSaving(true)
    setSaveErrorMessage(null)
    try {
      await onSave(toClientInput(values), coverChange)
      onClose()
    } catch (error) {
      setSaveErrorMessage(error instanceof Error ? error.message : serviceErrors.clientSave)
      setIsSaving(false)
    }
  }

  const isBusy = isSaving || isConfirmingDelete
  const submitLabel = isSaving ? common.saving : isEditMode ? clientStrings.form.saveChanges : clientStrings.form.create

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
        <FormField
          id="client-name"
          label={clientStrings.form.name}
          required
          maxLength={maximumClientNameLength}
          value={values.name}
          disabled={isBusy}
          errorMessage={fieldErrors.name}
          onChange={(event) => updateValue('name', event.target.value)}
        />
        <FormField
          id="client-email"
          label={clientStrings.form.email}
          type="email"
          value={values.email}
          disabled={isBusy}
          errorMessage={fieldErrors.email}
          onChange={(event) => updateValue('email', event.target.value)}
        />
        <FormField
          id="client-niche"
          label={clientStrings.form.niche}
          value={values.niche}
          disabled={isBusy}
          errorMessage={fieldErrors.niche}
          onChange={(event) => updateValue('niche', event.target.value)}
        />
        <FormField
          id="client-website"
          label={clientStrings.form.website}
          type="url"
          inputMode="url"
          placeholder={clientStrings.form.websitePlaceholder}
          value={values.website}
          disabled={isBusy}
          errorMessage={fieldErrors.website}
          onChange={(event) => updateValue('website', event.target.value)}
        />
        <FormField
          id="client-pay-in-rate"
          label={clientStrings.form.payInRate}
          inputMode="decimal"
          placeholder={clientStrings.form.ratePlaceholder}
          value={values.payInRate}
          disabled={isBusy}
          errorMessage={fieldErrors.payInRate}
          onChange={(event) => updateValue('payInRate', event.target.value)}
        />
        <FormField
          id="client-pay-out-rate"
          label={clientStrings.form.payOutRate}
          inputMode="decimal"
          placeholder={clientStrings.form.ratePlaceholder}
          value={values.payOutRate}
          disabled={isBusy}
          errorMessage={fieldErrors.payOutRate}
          onChange={(event) => updateValue('payOutRate', event.target.value)}
        />

        <ClientCoverField
          savedCoverUrl={client?.cover_image_url ?? null}
          coverChange={coverChange}
          disabled={isBusy}
          onChange={setCoverChange}
        />

        {saveErrorMessage && <StatusMessage variant="error">{saveErrorMessage}</StatusMessage>}

        {isConfirmingDelete && client && onDelete ? (
          <DeleteClientConfirmation clientName={client.name} onConfirm={onDelete} onCancel={() => setIsConfirmingDelete(false)} />
        ) : (
          <div className="flex items-center justify-between gap-2 pt-2">
            {/* Below the md breakpoint the save and close buttons sit in the drawer header. */}
            <div className="flex gap-2 max-md:hidden">
              <Button type="submit" variant="primary" disabled={isBusy}>
                {submitLabel}
              </Button>
              <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                {common.cancel}
              </Button>
            </div>
            {isEditMode && onDelete && (
              <Button variant="dangerGhost" onClick={() => setIsConfirmingDelete(true)} disabled={isSaving}>
                {common.delete}
              </Button>
            )}
          </div>
        )}
      </form>
    </Drawer>
  )
}
