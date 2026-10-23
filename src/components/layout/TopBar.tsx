import { LogOut, Search, Users } from 'lucide-react'
import { header } from '../../i18n/pt-BR'
import { Button } from '../ui/Button'
import { ConnectionStatusPill } from './ConnectionStatusPill'
import { UserIdentity } from './UserIdentity'

type TopBarProps = {
  title: string
  displayName: string | null
  avatarUrl: string | null
  isProfileOpen: boolean
  isSigningOut: boolean
  onSignOut: () => void
  onOpenClients: () => void
  onOpenProfile: () => void
}

// Below the md breakpoint only the title, the avatar and the sign out button are shown.
export function TopBar({
  title,
  displayName,
  avatarUrl,
  isProfileOpen,
  isSigningOut,
  onSignOut,
  onOpenClients,
  onOpenProfile,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-sticky shrink-0 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur md:static md:bg-background md:backdrop-blur-none">
      <div className="flex h-14 items-center justify-between gap-3 px-4 md:h-16 md:px-8">
        <h1 className="min-w-0 truncate text-lg font-semibold whitespace-nowrap">{title}</h1>
        <div className="flex shrink-0 items-center gap-2 md:gap-4">
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
          <Button
            variant="ghost"
            size="icon"
            aria-label={isSigningOut ? header.signingOut : header.signOut}
            title={header.signOut}
            onClick={onSignOut}
            disabled={isSigningOut}
          >
            <LogOut aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
