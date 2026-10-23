import { boards, screens } from '../../i18n/pt-BR'
import type { AppScreen } from '../../types/board'
import type { Board } from '../../types/database'
import { PageHeader } from '../layout/PageHeader'
import { Tabs, type TabOption } from '../ui/Tabs'
import { BoardScreen } from './BoardScreen'

const boardOptions: TabOption<Board>[] = [
  { value: 'support', label: screens.support },
  { value: 'implementation', label: screens.implementation },
]

type BoardPageProps = {
  board: Board
  currentUserId: string
  onBoardChange: (screen: AppScreen) => void
}

export function BoardPage({ board, currentUserId, onBoardChange }: BoardPageProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={boards.titles[board]}
        description={boards.descriptions[board]}
        actions={
          // The only board selector below the md breakpoint, so it spans the full width there.
          <div className="w-full md:w-auto">
            <Tabs
              options={boardOptions}
              value={board}
              layoutId="board-tab-indicator"
              ariaLabel={boards.boardTabsLabel}
              isFullWidth
              onChange={onBoardChange}
            />
          </div>
        }
      />
      {/* The key remounts the board so each board loads its own data and subscriptions. */}
      <BoardScreen key={board} board={board} currentUserId={currentUserId} />
    </div>
  )
}
