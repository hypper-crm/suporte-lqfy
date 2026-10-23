import type { Profile } from '../../types/database'
import { Avatar } from './Avatar'

const maximumVisibleAvatars = 3

export type AvatarStackPerson = {
  id: string
  // Undefined when the team member is not in the loaded profiles.
  profile: Profile | undefined
}

type AvatarStackProps = {
  people: AvatarStackPerson[]
  label: string
  unknownName: string
  moreLabel: (count: number) => string
}

// Overlapping avatars. The ring uses the card background color so each avatar stands out from the one below.
export function AvatarStack({ people, label, unknownName, moreLabel }: AvatarStackProps) {
  const visiblePeople = people.slice(0, maximumVisibleAvatars)
  const hiddenCount = people.length - visiblePeople.length

  return (
    <span role="img" aria-label={label} title={label} className="flex shrink-0 items-center">
      {visiblePeople.map(({ id, profile }, index) => (
        <Avatar
          key={id}
          size="small"
          fullName={profile?.full_name ?? unknownName}
          imageUrl={profile?.avatar_url}
          className={`ring-2 ring-elevated ${index > 0 ? '-ml-1.5' : ''}`}
        />
      ))}
      {hiddenCount > 0 && (
        <span className="-ml-1.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-hover px-1 text-[10px] font-semibold text-muted ring-2 ring-elevated">
          {moreLabel(hiddenCount)}
        </span>
      )}
    </span>
  )
}
