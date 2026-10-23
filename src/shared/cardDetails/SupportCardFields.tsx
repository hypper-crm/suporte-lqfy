import type { CardDetailsFormState } from '../../hooks/useCardDetailsForm'
import { cardDetails, priorityLabels, requestTypeLabels } from '../../i18n/pt-BR'
import { cardPriorityOptions, cardRequestTypeOptions } from '../../lib/cardFormValues'
import { Field } from '../../components/ui/Field'
import { Select } from '../../components/ui/Input'

// Fields only support cards have.

type SupportCardFieldProps = {
  form: CardDetailsFormState
}

export function CardPriorityField({ form }: SupportCardFieldProps) {
  return (
    <Field id="card-priority" label={cardDetails.fields.priority}>
      <Select
        id="card-priority"
        value={form.values.priority}
        disabled={form.isSaving}
        onChange={(event) => form.updateValue('priority', event.target.value as typeof form.values.priority)}
      >
        <option value="">{cardDetails.notSet}</option>
        {cardPriorityOptions.map((priority) => (
          <option key={priority} value={priority}>
            {priorityLabels[priority]}
          </option>
        ))}
      </Select>
    </Field>
  )
}

export function CardRequestTypeField({ form }: SupportCardFieldProps) {
  return (
    <Field id="card-request-type" label={cardDetails.fields.requestType}>
      <Select
        id="card-request-type"
        value={form.values.requestType}
        disabled={form.isSaving}
        onChange={(event) => form.updateValue('requestType', event.target.value as typeof form.values.requestType)}
      >
        <option value="">{cardDetails.notSet}</option>
        {cardRequestTypeOptions.map((requestType) => (
          <option key={requestType} value={requestType}>
            {requestTypeLabels[requestType]}
          </option>
        ))}
      </Select>
    </Field>
  )
}
