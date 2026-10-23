import { header } from '../../i18n/pt-BR'
import { Avatar } from '../ui/Avatar'
import { Skeleton } from '../ui/Skeleton'

type UserIdentityProps = {
  // Null while the profile is loading.
  displayName: string | null
  avatarUrl: string | null
  isProfileOpen: boolean
  onOpenProfile: () => void
}

export function UserIdentity({ displayName, avatarUrl, isProfileOpen, onOpenProfile }: UserIdentityProps) {
  if (!displayName) {
    return (
      <div className="flex items-center gap-2.5">
        <Skeleton className="size-8 rounded-full" />
        <div className="flex flex-col gap-1.5 max-md:hidden">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      aria-label={header.openProfile}
      aria-current={isProfileOpen ? 'page' : undefined}
      title={header.openProfile}
      onClick={onOpenProfile}
      className="flex min-h-11 items-center gap-2.5 rounded-full text-left outline-none transition-colors duration-200 ease-fluid hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent/40 md:min-h-0 md:py-1 md:pr-3 md:pl-1"
    >
      <Avatar fullName={displayName} imageUrl={avatarUrl} />
      {/* Below the md breakpoint only the avatar is shown. */}
      <span className="flex flex-col leading-tight max-md:hidden">
        <span className="max-w-40 truncate text-sm font-medium">{displayName}</span>
        <span className="text-[11px] text-muted">{header.teamMember}</span>
      </span>
    </button>
  )
}
