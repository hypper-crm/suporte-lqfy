import { auth } from '../i18n/pt-BR'
import type { AuthMode } from '../types/auth'

export type AuthFormValues = {
  fullName: string
  email: string
  password: string
}

export type AuthFormErrors = Partial<Record<keyof AuthFormValues, string>>

export const minimumPasswordLength = 8

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateAuthForm(values: AuthFormValues, mode: AuthMode): AuthFormErrors {
  const errors: AuthFormErrors = {}

  if (mode === 'create-account' && !values.fullName.trim()) {
    errors.fullName = auth.validation.fullNameRequired
  }

  if (!values.email.trim()) {
    errors.email = auth.validation.emailRequired
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = auth.validation.emailInvalid
  }

  if (!values.password) {
    errors.password = auth.validation.passwordRequired
  } else if (values.password.length < minimumPasswordLength) {
    errors.password = auth.validation.passwordTooShort(minimumPasswordLength)
  }

  return errors
}
