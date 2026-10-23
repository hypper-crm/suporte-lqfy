import { useCallback, useState } from 'react'
import {
  emptyClientFormValues,
  toClientFormValues,
  validateClientForm,
  type ClientEmailFormRow,
  type ClientFormErrors,
  type ClientFormValues,
  type ClientTextField,
} from '../lib/clientFormValidation'
import type { ClientCoverChange } from '../types/client'
import type { Client } from '../types/database'

export type ClientFormState = {
  values: ClientFormValues
  coverChange: ClientCoverChange
  fieldErrors: ClientFormErrors
  updateValue: (field: ClientTextField, value: string) => void
  updateEmails: (emails: ClientEmailFormRow[]) => void
  updateCover: (coverChange: ClientCoverChange) => void
  // Shows the errors and returns true when the values can be saved.
  validate: () => boolean
}

// Values of the client form, shared by the client drawer and the new implementation drawer.
// Null starts an empty form.
export function useClientForm(client: Client | null): ClientFormState {
  const [values, setValues] = useState<ClientFormValues>(() => (client ? toClientFormValues(client) : emptyClientFormValues))
  const [coverChange, setCoverChange] = useState<ClientCoverChange>({ kind: 'keep' })
  const [fieldErrors, setFieldErrors] = useState<ClientFormErrors>({})

  const updateValue = useCallback((field: ClientTextField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }, [])

  const updateEmails = useCallback((emails: ClientEmailFormRow[]) => {
    setValues((current) => ({ ...current, emails }))
    setFieldErrors((current) => ({ ...current, emails: undefined }))
  }, [])

  const validate = useCallback(() => {
    const errors = validateClientForm(values)
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [values])

  return { values, coverChange, fieldErrors, updateValue, updateEmails, updateCover: setCoverChange, validate }
}
