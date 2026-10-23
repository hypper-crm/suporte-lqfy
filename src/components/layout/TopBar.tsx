import { LogOut, Search, Users } from 'lucide-react'
import { header } from '../../i18n/pt-BR'
import { Button } from '../ui/Button'
import { ConnectionStatusPill } from './ConnectionStatusPill'
import { UserIdentity } from './UserIdentity'

type TopBarProps = {
  title: string
  displayName: string | null
  isSigningOut: boolean
  onSignOut: () => void
  onOpenClients: () => void
}

export function TopBar({ title, displayName, isSigningOut, onSignOut, onOpenClients }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4 md:px-8">
      <h1 className="truncate text-lg font-semibold">{title}</h1>
      <div className="flex min-w-0 items-center gap-2 md:gap-4">
        {/* Visual only for now. */}
        <div
          aria-hidden="true"
          className="hidden h-9 w-64 items-center gap-2 rounded-full border border-border bg-surface pr-1.5 pl-3 text-sm text-subtle lg:flex"
        >
          <Search className="size-4 text-muted" />
          <span className="flex-1">{header.searchPlaceholder}</span>
          <kbd className="rounded-md border border-border-strong px-1.5 py-0.5 font-sans text-[11px] text-muted">{header.searchShortcut}</kbd>
        </div>
        <Button variant="link" onClick={onOpenClients}>
          <Users aria-hidden="true" className="size-4" />
          {header.clients}
        </Button>
        <div className="hidden sm:block">
          <ConnectionStatusPill />
        </div>
        <div className="hidden h-6 w-px bg-border sm:block" />
        <div className="hidden sm:block">
          <UserIdentity displayName={displayName} />
        </div>
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
    </header>
  )
}
