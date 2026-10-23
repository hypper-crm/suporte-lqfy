import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import type { SessionState } from '../hooks/useSession'
import { common } from '../i18n/pt-BR'
import { screenLabels } from '../lib/screens'
import type { User } from '../types/auth'
import type { AppScreen } from '../types/board'
import { BoardPage } from './board/BoardPage'
import { ClientsScreen } from './clients/ClientsScreen'
import { MobileTabBar } from './layout/MobileTabBar'
import { Sidebar } from './layout/Sidebar'
import { TopBar } from './layout/TopBar'
import { StepSettingsScreen } from './stepSettings/StepSettingsScreen'
import { Button } from './ui/Button'
import { StatusMessage } from './ui/StatusMessage'

type SignedInScreenProps = Pick<SessionState, 'isSigningOut' | 'signOutErrorMessage' | 'signOut'> & {
  user: User
}

export function SignedInScreen({ user, isSigningOut, signOutErrorMessage, signOut }: SignedInScreenProps) {
  const [activeScreen, setActiveScreen] = useState<AppScreen>('support')
  const { profile, errorMessage: profileErrorMessage, reload: reloadProfile } = useProfile(user.id)
  const displayName = profile?.full_name || user.email || null

  return (
    <div className="flex h-dvh bg-background text-foreground">
      <Sidebar activeScreen={activeScreen} onScreenChange={setActiveScreen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={screenLabels[activeScreen]}
          // Without a profile there is no name to show, unless loading failed and the email is the fallback.
          displayName={profile || profileErrorMessage ? displayName : null}
          isSigningOut={isSigningOut}
          onSignOut={() => void signOut()}
          onOpenClients={() => setActiveScreen('clients')}
        />
        <MobileTabBar activeScreen={activeScreen} onScreenChange={setActiveScreen} />
        {(signOutErrorMessage || profileErrorMessage) && (
          <div className="flex flex-col gap-2 px-4 md:px-8 pt-4">
            {signOutErrorMessage && <StatusMessage variant="error">{signOutErrorMessage}</StatusMessage>}
            {profileErrorMessage && (
              <div className="flex items-center gap-3">
                <StatusMessage variant="error">{profileErrorMessage}</StatusMessage>
                <Button variant="link" onClick={reloadProfile}>
                  {common.tryAgain}
                </Button>
              </div>
            )}
          </div>
        )}
        <main className="flex min-h-0 flex-1 flex-col">
          {activeScreen === 'clients' && <ClientsScreen />}
          {activeScreen === 'stepSettings' && <StepSettingsScreen />}
          {(activeScreen === 'support' || activeScreen === 'implementation') && (
            <BoardPage board={activeScreen} currentUserId={user.id} onBoardChange={setActiveScreen} />
          )}
        </main>
      </div>
    </div>
  )
}
