import type { CardDetailsFormState } from '../../hooks/useCardDetailsForm'
import { cardDetails } from '../../i18n/pt-BR'
import { maximumCardTitleLength } from '../../lib/cardFormValues'
import type { Client, Profile } from '../../types/database'
import { Field } from '../../components/ui/Field'
import { FormField } from '../../components/ui/FormField'
import { Select, Textarea } from '../../components/ui/Input'

// Fields shared by the support and implementation card drawers.

type CardFieldProps = {
  form: CardDetailsFormState
}

export function CardTitleField({ form }: CardFieldProps) {
  return (
    <FormField
      id="card-title"
      label={cardDetails.fields.title}
      required
      maxLength={maximumCardTitleLength}
      value={form.values.title}
      disabled={form.isSaving}
      errorMessage={form.titleErrorMessage}
      onChange={(event) => form.updateValue('title', event.target.value)}
    />
  )
}

export function CardDescriptionField({ form }: CardFieldProps) {
  return (
    <Field id="card-description" label={cardDetails.fields.description}>
      <Textarea
        id="card-description"
        rows={5}
        value={form.values.description}
        disabled={form.isSaving}
        onChange={(event) => form.updateValue('description', event.target.value)}
      />
    </Field>
  )
}

export function CardStartDateField({ form }: CardFieldProps) {
  return (
    <FormField
      id="card-start-date"
      label={cardDetails.fields.startDate}
      type="date"
      lang="pt-BR"
      value={form.values.startDate}
      disabled={form.isSaving}
      onChange={(event) => form.updateValue('startDate', event.target.value)}
    />
  )
}

type CardClientFieldProps = CardFieldProps & {
  clients: Client[]
}

export function CardClientField({ form, clients }: CardClientFieldProps) {
  const { clientId } = form.values
  // A client that no longer exists is still listed, so the select keeps showing the saved value.
  const isClientMissing = clientId !== '' && !clients.some((client) => client.id === clientId)

  return (
    <Field id="card-client" label={cardDetails.fields.client}>
      <Select
        id="card-client"
        value={clientId}
        disabled={form.isSaving}
        onChange={(event) => form.updateValue('clientId', event.target.value)}
      >
        <option value="">{cardDetails.noClient}</option>
        {isClientMissing && <option value={clientId}>{cardDetails.unknownClient}</option>}
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </Select>
    </Field>
  )
}

type CardAssigneeFieldProps = CardFieldProps & {
  profiles: Profile[]
}

export function CardAssigneeField({ form, profiles }: CardAssigneeFieldProps) {
  const { assigneeId } = form.values
  // A team member that no longer exists is still listed, so the select keeps showing the saved value.
  const isAssigneeMissing = assigneeId !== '' && !profiles.some((profile) => profile.id === assigneeId)

  return (
    <Field id="card-assignee" label={cardDetails.fields.assignee}>
      <Select
        id="card-assignee"
        value={assigneeId}
        disabled={form.isSaving}
        onChange={(event) => form.updateValue('assigneeId', event.target.value)}
      >
        <option value="">{cardDetails.unassigned}</option>
        {isAssigneeMissing && <option value={assigneeId}>{cardDetails.unknownTeamMember}</option>}
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.full_name || cardDetails.unnamedTeamMember}
          </option>
        ))}
      </Select>
    </Field>
  )
}
