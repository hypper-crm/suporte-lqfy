import { useCallback, useEffect, useState } from 'react'
import { auth } from '../i18n/pt-BR'
import { getCurrentSession, signOut as signOutRequest, subscribeToAuthChanges } from '../services/authService'
import type { Session, User } from '../types/auth'

export type SessionState = {
  session: Session | null
  user: User | null
  isLoading: boolean
  errorMessage: string | null
  isSigningOut: boolean
  signOutErrorMessage: string | null
  signOut: () => Promise<void>
}

export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutErrorMessage, setSignOutErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    getCurrentSession()
      .then((currentSession) => {
        if (isActive) setSession(currentSession)
      })
      .catch((error: Error) => {
        if (isActive) setErrorMessage(error.message)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    const unsubscribe = subscribeToAuthChanges((nextSession) => {
      if (!isActive) return
      setSession(nextSession)
      setErrorMessage(null)
      setIsLoading(false)
    })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    setIsSigningOut(true)
    setSignOutErrorMessage(null)
    try {
      await signOutRequest()
    } catch (error) {
      setSignOutErrorMessage(error instanceof Error ? error.message : auth.errors.signOutFailed)
    } finally {
      setIsSigningOut(false)
    }
  }, [])

  return {
    session,
    user: session?.user ?? null,
    isLoading,
    errorMessage,
    isSigningOut,
    signOutErrorMessage,
    signOut,
  }
}
