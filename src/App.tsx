import { LoginScreen } from './components/auth/LoginScreen'
import { FullPageMessage } from './components/common/FullPageMessage'
import { StatusMessage } from './components/ui/StatusMessage'
import { SignedInScreen } from './components/SignedInScreen'
import { useSession } from './hooks/useSession'
import { appStart } from './i18n/pt-BR'

export function App() {
  const { user, isLoading, errorMessage, isSigningOut, signOutErrorMessage, signOut } = useSession()

  if (isLoading) {
    return (
      <FullPageMessage>
        <p role="status" className="text-sm text-muted">{appStart.loadingSession}</p>
      </FullPageMessage>
    )
  }

  if (!user) {
    return (
      <>
        {errorMessage && (
          <div className="fixed inset-x-0 top-4 flex justify-center">
            <StatusMessage variant="error">{errorMessage}</StatusMessage>
          </div>
        )}
        <LoginScreen />
      </>
    )
  }

  return (
    <SignedInScreen user={user} isSigningOut={isSigningOut} signOutErrorMessage={signOutErrorMessage} signOut={signOut} />
  )
}
