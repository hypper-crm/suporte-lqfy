import type { AvatarStackPerson } from '../components/ui/AvatarStack'
import type { Profile } from '../types/database'

const noAssignees: AvatarStackPerson[] = []

// Assignees in team member name order, for the stacked avatars on cards.
export function toAssigneePeople(assigneeIds: string[] | undefined, profilesById: Record<string, Profile>): AvatarStackPerson[] {
  if (!assigneeIds || assigneeIds.length === 0) return noAssignees
  return assigneeIds
    .map((id) => ({ id, profile: profilesById[id] }))
    .sort((first, second) =>
      (first.profile?.full_name ?? '').localeCompare(second.profile?.full_name ?? '', undefined, { sensitivity: 'base' }),
    )
}
