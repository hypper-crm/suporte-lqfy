import type { ClientFormState } from '../../hooks/useClientForm'
import { clients as clientStrings } from '../../i18n/pt-BR'
import { maximumClientNameLength } from '../../lib/clientFormValidation'
import { FormField } from '../ui/FormField'
import { ClientCoverField } from './ClientCoverField'
import { ClientEmailsField } from './ClientEmailsField'

// The client form fields, split in two groups so a form can place the details apart from the main fields.

type ClientFieldsProps = {
  form: ClientFormState
  disabled: boolean
}

type ClientMainFieldsProps = ClientFieldsProps & {
  nameLabel?: string
}

// Name, emails and niche.
export function ClientMainFields({ form, disabled, nameLabel = clientStrings.form.name }: ClientMainFieldsProps) {
  const { values, fieldErrors, updateValue, updateEmails } = form
  return (
    <>
      <FormField
        id="client-name"
        label={nameLabel}
        required
        maxLength={maximumClientNameLength}
        value={values.name}
        disabled={disabled}
        errorMessage={fieldErrors.name}
        onChange={(event) => updateValue('name', event.target.value)}
      />
      <ClientEmailsField rows={values.emails} errorMessages={fieldErrors.emails} disabled={disabled} onChange={updateEmails} />
      <FormField
        id="client-niche"
        label={clientStrings.form.niche}
        value={values.niche}
        disabled={disabled}
        errorMessage={fieldErrors.niche}
        onChange={(event) => updateValue('niche', event.target.value)}
      />
    </>
  )
}

type ClientDetailFieldsProps = ClientFieldsProps & {
  // The cover saved on the client, if any.
  savedCoverUrl: string | null
}

// Website, rates and cover image.
export function ClientDetailFields({ form, disabled, savedCoverUrl }: ClientDetailFieldsProps) {
  const { values, fieldErrors, coverChange, updateValue, updateCover } = form
  return (
    <>
      <FormField
        id="client-website"
        label={clientStrings.form.website}
        type="url"
        inputMode="url"
        placeholder={clientStrings.form.websitePlaceholder}
        value={values.website}
        disabled={disabled}
        errorMessage={fieldErrors.website}
        onChange={(event) => updateValue('website', event.target.value)}
      />
      <FormField
        id="client-pay-in-rate"
        label={clientStrings.form.payInRate}
        inputMode="decimal"
        placeholder={clientStrings.form.ratePlaceholder}
        value={values.payInRate}
        disabled={disabled}
        errorMessage={fieldErrors.payInRate}
        onChange={(event) => updateValue('payInRate', event.target.value)}
      />
      <FormField
        id="client-pay-out-rate"
        label={clientStrings.form.payOutRate}
        inputMode="decimal"
        placeholder={clientStrings.form.ratePlaceholder}
        value={values.payOutRate}
        disabled={disabled}
        errorMessage={fieldErrors.payOutRate}
        onChange={(event) => updateValue('payOutRate', event.target.value)}
      />
      <ClientCoverField savedCoverUrl={savedCoverUrl} coverChange={coverChange} disabled={disabled} onChange={updateCover} />
    </>
  )
}

// True when a field of the details group has an error, so a collapsed details section can open.
export function hasClientDetailErrors(form: ClientFormState): boolean {
  const { website, payInRate, payOutRate } = form.fieldErrors
  return Boolean(website || payInRate || payOutRate)
}
