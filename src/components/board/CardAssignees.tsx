import { boards } from '../../i18n/pt-BR'
import { AvatarStack, type AvatarStackPerson } from '../ui/AvatarStack'

type CardAssigneesProps = {
  assignees: AvatarStackPerson[]
}

export function CardAssignees({ assignees }: CardAssigneesProps) {
  if (assignees.length === 0) return <span className="shrink-0 text-[11px] text-subtle">{boards.card.unassigned}</span>

  const names = assignees.map(({ profile }) => profile?.full_name || boards.card.unknownTeamMember).join(', ')
  return (
    <AvatarStack
      people={assignees}
      label={boards.card.assigneesLabel(names)}
      unknownName={boards.card.unknownTeamMember}
      moreLabel={boards.card.moreAssignees}
    />
  )
}
