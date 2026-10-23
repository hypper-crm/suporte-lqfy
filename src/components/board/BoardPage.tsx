import { boards } from '../../i18n/pt-BR'
import type { Board } from '../../types/database'
import { PageHeader } from '../layout/PageHeader'
import { BoardScreen } from './BoardScreen'

type BoardPageProps = {
  board: Board
  currentUserId: string
}

// Boards are switched from the sidebar, or from the side menu below the md breakpoint.
export function BoardPage({ board, currentUserId }: BoardPageProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={boards.titles[board]} description={boards.descriptions[board]} />
      {/* The key remounts the board so each board loads its own data and subscriptions. */}
      <BoardScreen key={board} board={board} currentUserId={currentUserId} />
    </div>
  )
}
