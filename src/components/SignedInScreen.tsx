import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import type { SessionState } from '../hooks/useSession'
import { common } from '../i18n/pt-BR'
import { screenLabels } from '../lib/screens'
import type { User } from '../types/auth'
import type { AppScreen } from '../types/board'
import type { Board } from '../types/database'
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
  // Reopened by the boards tab of the mobile tab bar.
  const [lastBoard, setLastBoard] = useState<Board>('support')
  const { profile, errorMessage: profileErrorMessage, reload: reloadProfile } = useProfile(user.id)
  const displayName = profile?.full_name || user.email || null

  function changeScreen(screen: AppScreen) {
    setActiveScreen(screen)
    if (screen === 'support' || screen === 'implementation') setLastBoard(screen)
  }

  return (
    // Below the md breakpoint the page scrolls as a whole. From md up, each screen scrolls inside the main area.
    <div className="flex min-h-dvh bg-background text-foreground md:h-dvh">
      <Sidebar activeScreen={activeScreen} onScreenChange={changeScreen} />
      <div className="pb-mobile-tab-bar flex min-w-0 flex-1 flex-col overflow-x-clip pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] md:pb-0">
        <TopBar
          title={screenLabels[activeScreen]}
          // Without a profile there is no name to show, unless loading failed and the email is the fallback.
          displayName={profile || profileErrorMessage ? displayName : null}
          isSigningOut={isSigningOut}
          onSignOut={() => void signOut()}
          onOpenClients={() => changeScreen('clients')}
        />
        {(signOutErrorMessage || profileErrorMessage) && (
          <div className="flex flex-col gap-2 px-4 md:px-8 pt-4">
            {signOutErrorMessage && <StatusMessage variant="error">{signOutErrorMessage}</StatusMessage>}
            {profileErrorMessage && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <StatusMessage variant="error">{profileErrorMessage}</StatusMessage>
                <Button variant="link" onClick={reloadProfile}>
                  {common.tryAgain}
                </Button>
              </div>
            )}
          </div>
        )}
        <main className="flex flex-1 flex-col md:min-h-0">
          {activeScreen === 'clients' && <ClientsScreen />}
          {activeScreen === 'stepSettings' && <StepSettingsScreen />}
          {(activeScreen === 'support' || activeScreen === 'implementation') && (
            <BoardPage board={activeScreen} currentUserId={user.id} onBoardChange={changeScreen} />
          )}
        </main>
      </div>
      <MobileTabBar activeScreen={activeScreen} lastBoard={lastBoard} onScreenChange={changeScreen} />
    </div>
  )
}
