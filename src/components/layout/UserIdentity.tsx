import { header } from '../../i18n/pt-BR'
import { Avatar } from '../ui/Avatar'
import { Skeleton } from '../ui/Skeleton'

type UserIdentityProps = {
  // Null while the profile is loading.
  displayName: string | null
}

export function UserIdentity({ displayName }: UserIdentityProps) {
  if (!displayName) {
    return (
      <div className="flex items-center gap-2.5">
        <Skeleton className="size-8 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5">
      <Avatar fullName={displayName} />
      <div className="flex flex-col leading-tight">
        <span className="max-w-40 truncate text-sm font-medium">{displayName}</span>
        <span className="text-[11px] text-muted">{header.teamMember}</span>
      </div>
    </div>
  )
}
