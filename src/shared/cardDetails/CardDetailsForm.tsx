import type { FormEvent, ReactNode } from 'react'
import type { CardDetailsFormState } from '../../hooks/useCardDetailsForm'
import { cardDetails, common } from '../../i18n/pt-BR'
import { Button } from '../../components/ui/Button'
import { StatusMessage } from '../../components/ui/StatusMessage'

// Lets the save button in the drawer header submit the form.
const cardDetailsFormId = 'card-details-form'

type CardSaveButtonProps = {
  form: CardDetailsFormState
  className?: string
}

export function CardSaveButton({ form, className = '' }: CardSaveButtonProps) {
  return (
    <Button type="submit" form={cardDetailsFormId} variant="primary" disabled={form.isSaving || !form.isDirty} className={className}>
      {form.isSaving ? common.saving : common.save}
    </Button>
  )
}

type CardDetailsFormProps = {
  form: CardDetailsFormState
  // The editable fields of the card.
  children: ReactNode
}

// Wraps the editable fields with the save button and the save, error and conflict messages.
export function CardDetailsForm({ form, children }: CardDetailsFormProps) {
  const { isDirty, isSaved, saveErrorMessage, hasRemoteChanges } = form

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void form.save()
  }

  return (
    <form id={cardDetailsFormId} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      {hasRemoteChanges && (
        <div className="flex flex-col items-start gap-2">
          <StatusMessage variant="info">{cardDetails.remoteChanges}</StatusMessage>
          <Button variant="link" onClick={form.loadLatestVersion}>
            {cardDetails.loadLatestVersion}
          </Button>
        </div>
      )}

      {children}

      {saveErrorMessage && <StatusMessage variant="error">{saveErrorMessage}</StatusMessage>}
      {isSaved && !isDirty && <StatusMessage variant="success">{common.saved}</StatusMessage>}

      {/* Below the md breakpoint the save button sits in the drawer header. */}
      <CardSaveButton form={form} className="self-start max-md:hidden" />
    </form>
  )
}
