import type { Session, User } from '@supabase/supabase-js'

export type AuthMode = 'sign-in' | 'create-account'

export type SignInCredentials = {
  email: string
  password: string
}

export type SignUpCredentials = SignInCredentials & {
  fullName: string
}

export type SignUpResult = {
  session: Session | null
}

export type { Session, User }
