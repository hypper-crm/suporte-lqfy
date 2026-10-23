import { X } from 'lucide-react'
import type { CardDetailsFormState } from '../../hooks/useCardDetailsForm'
import { cardDetails } from '../../i18n/pt-BR'
import { maximumCardTitleLength } from '../../lib/cardFormValues'
import type { Client, Profile } from '../../types/database'
import { Avatar } from '../../components/ui/Avatar'
import { Field } from '../../components/ui/Field'
import { FormField } from '../../components/ui/FormField'
import { Select, Textarea } from '../../components/ui/Input'

// Fields shared by the support and implementation card drawers.

type CardFieldProps = {
  form: CardDetailsFormState
}

type CardTitleFieldProps = CardFieldProps & {
  isRequired?: boolean
}

export function CardTitleField({ form, isRequired = true }: CardTitleFieldProps) {
  return (
    <FormField
      id="card-title"
      label={isRequired ? cardDetails.fields.title : cardDetails.fields.optionalTitle}
      required={isRequired}
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

type CardAssigneesFieldProps = CardFieldProps & {
  profiles: Profile[]
}

export function CardAssigneesField({ form, profiles }: CardAssigneesFieldProps) {
  const { assigneeIds } = form.values
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]))
  const unassignedProfiles = profiles.filter((profile) => !assigneeIds.includes(profile.id))
  // Team members that no longer exist stay listed, so saving does not drop them silently.
  const selectedMembers = assigneeIds
    .map((id) => ({ id, profile: profilesById.get(id) }))
    .sort((first, second) =>
      (first.profile?.full_name ?? '').localeCompare(second.profile?.full_name ?? '', undefined, { sensitivity: 'base' }),
    )

  return (
    <Field id="card-assignees" label={cardDetails.fields.assignees}>
      {selectedMembers.length === 0 ? (
        <p className="text-sm text-subtle">{cardDetails.unassigned}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {selectedMembers.map(({ id, profile }) => {
            const name = profile ? profile.full_name || cardDetails.unnamedTeamMember : cardDetails.unknownTeamMember
            return (
              <li key={id} className="flex h-9 items-center gap-2 rounded-full border border-border bg-elevated pr-1 pl-1">
                <Avatar size="small" fullName={name} imageUrl={profile?.avatar_url} />
                <span className="max-w-40 truncate text-sm">{name}</span>
                <button
                  type="button"
                  aria-label={cardDetails.removeAssignee(name)}
                  title={cardDetails.removeAssignee(name)}
                  disabled={form.isSaving}
                  onClick={() => form.updateValue('assigneeIds', assigneeIds.filter((assigneeId) => assigneeId !== id))}
                  className="flex size-7 items-center justify-center rounded-full text-muted outline-none transition-colors duration-200 ease-fluid hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50"
                >
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <Select
        id="card-assignees"
        value=""
        disabled={form.isSaving || unassignedProfiles.length === 0}
        onChange={(event) => {
          if (event.target.value) form.updateValue('assigneeIds', [...assigneeIds, event.target.value])
        }}
      >
        <option value="">{unassignedProfiles.length === 0 ? cardDetails.allMembersAssigned : cardDetails.addAssignee}</option>
        {unassignedProfiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.full_name || cardDetails.unnamedTeamMember}
          </option>
        ))}
      </Select>
    </Field>
  )
}
