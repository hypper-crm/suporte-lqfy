import type { InputHTMLAttributes } from 'react'
import { Field, fieldErrorId } from './Field'
import { Input } from './Input'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  errorMessage?: string
}

export function FormField({ id, label, errorMessage, ...inputProps }: FormFieldProps) {
  return (
    <Field id={id} label={label} errorMessage={errorMessage}>
      <Input
        id={id}
        hasError={Boolean(errorMessage)}
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? fieldErrorId(id) : undefined}
        {...inputProps}
      />
    </Field>
  )
}
