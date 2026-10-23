import { AnimatePresence } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import type { SessionState } from '../hooks/useSession'
import { common } from '../i18n/pt-BR'
import { screenLabels } from '../lib/screens'
import type { User } from '../types/auth'
import type { AppScreen } from '../types/board'
import { BoardPage } from './board/BoardPage'
import { ClientsScreen } from './clients/ClientsScreen'
import { DeadlineSettingsScreen } from './deadlineSettings/DeadlineSettingsScreen'
import { MobileSideMenu } from './layout/MobileSideMenu'
import { Sidebar } from './layout/Sidebar'
import { TopBar } from './layout/TopBar'
import { ProfileScreen } from './profile/ProfileScreen'
import { StepSettingsScreen } from './stepSettings/StepSettingsScreen'
import { Button } from './ui/Button'
import { StatusMessage } from './ui/StatusMessage'

type SignedInScreenProps = Pick<SessionState, 'isSigningOut' | 'signOutErrorMessage' | 'signOut'> & {
  user: User
}

export function SignedInScreen({ user, isSigningOut, signOutErrorMessage, signOut }: SignedInScreenProps) {
  const [activeScreen, setActiveScreen] = useState<AppScreen>('support')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { profile, errorMessage: profileErrorMessage, reload: reloadProfile, uploadAvatar } = useProfile(user.id)
  const displayName = profile?.full_name || user.email || null

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    menuButtonRef.current?.focus()
  }, [])

  return (
    // Below the md breakpoint the page scrolls as a whole. From md up, each screen scrolls inside the main area.
    <div className="flex min-h-dvh bg-background text-foreground md:h-dvh">
      <Sidebar activeScreen={activeScreen} onScreenChange={setActiveScreen} />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-clip pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] md:pb-0">
        <TopBar
          title={screenLabels[activeScreen]}
          // Without a profile there is no name to show, unless loading failed and the email is the fallback.
          displayName={profile || profileErrorMessage ? displayName : null}
          avatarUrl={profile?.avatar_url ?? null}
          isProfileOpen={activeScreen === 'profile'}
          isSigningOut={isSigningOut}
          isMenuOpen={isMenuOpen}
          menuButtonRef={menuButtonRef}
          onSignOut={() => void signOut()}
          onOpenClients={() => setActiveScreen('clients')}
          onOpenProfile={() => setActiveScreen('profile')}
          onOpenMenu={() => setIsMenuOpen(true)}
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
          {activeScreen === 'deadlineSettings' && <DeadlineSettingsScreen />}
          {activeScreen === 'profile' && <ProfileScreen profile={profile} email={user.email ?? null} onUploadAvatar={uploadAvatar} />}
          {(activeScreen === 'support' || activeScreen === 'implementation') && (
            <BoardPage board={activeScreen} currentUserId={user.id} />
          )}
        </main>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <MobileSideMenu
            activeScreen={activeScreen}
            isSigningOut={isSigningOut}
            onScreenChange={setActiveScreen}
            onSignOut={() => void signOut()}
            onClose={closeMenu}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
