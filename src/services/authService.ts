import { AuthError } from '@supabase/supabase-js'
import { auth } from '../i18n/pt-BR'
import { supabase } from '../lib/supabase'
import type { Session, SignInCredentials, SignUpCredentials, SignUpResult } from '../types/auth'

const authErrorMessages: Record<string, string> = {
  invalid_credentials: auth.errors.invalidCredentials,
  user_already_exists: auth.errors.userAlreadyExists,
  email_exists: auth.errors.userAlreadyExists,
  weak_password: auth.errors.weakPassword,
  email_address_invalid: auth.errors.emailInvalid,
  email_not_confirmed: auth.errors.emailNotConfirmed,
  signup_disabled: auth.errors.signupDisabled,
  email_provider_disabled: auth.errors.signupDisabled,
  over_request_rate_limit: auth.errors.rateLimited,
  over_email_send_rate_limit: auth.errors.rateLimited,
  same_password: auth.errors.samePassword,
  session_expired: auth.errors.sessionExpired,
  session_not_found: auth.errors.sessionExpired,
  refresh_token_not_found: auth.errors.sessionExpired,
}

function toUserFriendlyError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof AuthError) {
    if (error.code && authErrorMessages[error.code]) {
      return new Error(authErrorMessages[error.code])
    }
    if (error.name === 'AuthRetryableFetchError') {
      return new Error(auth.errors.network)
    }
  }
  return new Error(fallbackMessage)
}

export async function signUp({ fullName, email, password }: SignUpCredentials): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw toUserFriendlyError(error, auth.errors.signUpFailed)
  return { session: data.session }
}

export async function signIn({ email, password }: SignInCredentials): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw toUserFriendlyError(error, auth.errors.signInFailed)
  return data.session
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw toUserFriendlyError(error, auth.errors.signOutFailed)
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw toUserFriendlyError(error, auth.errors.sessionLoadFailed)
  return data.session
}

export function subscribeToAuthChanges(onChange: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => onChange(session))
  return () => data.subscription.unsubscribe()
}
