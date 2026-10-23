import { useState, type FormEvent } from 'react'
import { auth, common } from '../../i18n/pt-BR'
import { minimumPasswordLength, validateAuthForm, type AuthFormErrors, type AuthFormValues } from '../../lib/authFormValidation'
import { signIn, signUp } from '../../services/authService'
import type { AuthMode } from '../../types/auth'
import { Button } from '../ui/Button'
import { FormField } from '../ui/FormField'
import { StatusMessage } from '../ui/StatusMessage'
import { AuthModeTabs } from './AuthModeTabs'

const emptyFormValues: AuthFormValues = { fullName: '', email: '', password: '' }

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [values, setValues] = useState<AuthFormValues>(emptyFormValues)
  const [fieldErrors, setFieldErrors] = useState<AuthFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const isCreatingAccount = mode === 'create-account'

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setFieldErrors({})
    setErrorMessage(null)
    setInfoMessage(null)
  }

  function updateField(field: keyof AuthFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setInfoMessage(null)

    const errors = validateAuthForm(values, mode)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    const email = values.email.trim()
    setIsSubmitting(true)
    try {
      if (isCreatingAccount) {
        const { session } = await signUp({ fullName: values.fullName.trim(), email, password: values.password })
        if (!session) {
          setMode('sign-in')
          setValues({ ...emptyFormValues, email })
          setInfoMessage(auth.accountCreatedSignInManually)
        }
      } else {
        await signIn({ email, password: values.password })
      }
      // On success the session hook picks up the new session and the app leaves this screen.
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : common.unknownError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitLabel = isCreatingAccount
    ? isSubmitting ? auth.creatingAccount : auth.createAccount
    : isSubmitting ? auth.signingIn : auth.signIn

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthModeTabs mode={mode} isDisabled={isSubmitting} onChange={changeMode} />

      {isCreatingAccount && (
        <FormField
          id="full-name"
          label={auth.fullName}
          autoComplete="name"
          value={values.fullName}
          disabled={isSubmitting}
          errorMessage={fieldErrors.fullName}
          onChange={(event) => updateField('fullName', event.target.value)}
        />
      )}
      <FormField
        id="email"
        label={auth.email}
        type="email"
        autoComplete="email"
        value={values.email}
        disabled={isSubmitting}
        errorMessage={fieldErrors.email}
        onChange={(event) => updateField('email', event.target.value)}
      />
      <FormField
        id="password"
        label={auth.password}
        type="password"
        autoComplete={isCreatingAccount ? 'new-password' : 'current-password'}
        placeholder={isCreatingAccount ? auth.passwordPlaceholder(minimumPasswordLength) : undefined}
        value={values.password}
        disabled={isSubmitting}
        errorMessage={fieldErrors.password}
        onChange={(event) => updateField('password', event.target.value)}
      />

      {errorMessage && <StatusMessage variant="error">{errorMessage}</StatusMessage>}
      {infoMessage && <StatusMessage variant="info">{infoMessage}</StatusMessage>}

      <Button type="submit" variant="primary" disabled={isSubmitting} className="mt-1 h-10 w-full">
        {submitLabel}
      </Button>
    </form>
  )
}
