import { LogOut, Menu, Search, Users } from 'lucide-react'
import type { Ref } from 'react'
import { header } from '../../i18n/pt-BR'
import { Button } from '../ui/Button'
import { ConnectionStatusPill } from './ConnectionStatusPill'
import { mobileSideMenuId } from './MobileSideMenu'
import { UserIdentity } from './UserIdentity'

type TopBarProps = {
  title: string
  displayName: string | null
  avatarUrl: string | null
  isProfileOpen: boolean
  isSigningOut: boolean
  isMenuOpen: boolean
  // Receives focus back when the mobile side menu closes.
  menuButtonRef: Ref<HTMLButtonElement>
  onSignOut: () => void
  onOpenClients: () => void
  onOpenProfile: () => void
  onOpenMenu: () => void
}

// Below the md breakpoint the bar shows the menu button, the centered title and the avatar.
export function TopBar({
  title,
  displayName,
  avatarUrl,
  isProfileOpen,
  isSigningOut,
  isMenuOpen,
  menuButtonRef,
  onSignOut,
  onOpenClients,
  onOpenProfile,
  onOpenMenu,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-sticky shrink-0 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur md:static md:bg-background md:backdrop-blur-none">
      <div className="grid h-14 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 px-2 md:flex md:h-16 md:justify-between md:gap-3 md:px-8">
        <Button
          ref={menuButtonRef}
          variant="ghost"
          size="icon"
          aria-label={header.openMenu}
          aria-haspopup="dialog"
          aria-expanded={isMenuOpen}
          aria-controls={isMenuOpen ? mobileSideMenuId : undefined}
          onClick={onOpenMenu}
          className="md:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
        <h1 className="min-w-0 truncate text-center text-lg font-semibold whitespace-nowrap md:text-left">{title}</h1>
        <div className="flex shrink-0 items-center justify-self-end gap-2 md:gap-4">
          {/* Visual only for now. */}
          <div
            aria-hidden="true"
            className="hidden h-9 w-64 items-center gap-2 rounded-full border border-border bg-surface pr-1.5 pl-3 text-sm text-subtle lg:flex"
          >
            <Search className="size-4 text-muted" />
            <span className="flex-1">{header.searchPlaceholder}</span>
            <kbd className="rounded-md border border-border-strong px-1.5 py-0.5 font-sans text-[11px] text-muted">{header.searchShortcut}</kbd>
          </div>
          <Button variant="link" onClick={onOpenClients} className="max-md:hidden">
            <Users aria-hidden="true" className="size-4" />
            {header.clients}
          </Button>
          <div className="hidden md:block">
            <ConnectionStatusPill />
          </div>
          <div className="hidden h-6 w-px bg-border md:block" />
          <UserIdentity displayName={displayName} avatarUrl={avatarUrl} isProfileOpen={isProfileOpen} onOpenProfile={onOpenProfile} />
          {/* Below the md breakpoint signing out is in the side menu. */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={isSigningOut ? header.signingOut : header.signOut}
            title={header.signOut}
            onClick={onSignOut}
            disabled={isSigningOut}
            className="max-md:hidden"
          >
            <LogOut aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
