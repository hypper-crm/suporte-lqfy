import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { boards } from '../../i18n/pt-BR'
import type { Board } from '../../types/database'
import { PageHeader } from '../layout/PageHeader'
import { Button } from '../ui/Button'
import { BoardScreen } from './BoardScreen'

type BoardPageProps = {
  board: Board
  currentUserId: string
}

// Boards are switched from the sidebar, or from the side menu below the md breakpoint.
export function BoardPage({ board, currentUserId }: BoardPageProps) {
  const [isNewImplementationOpen, setIsNewImplementationOpen] = useState(false)
  const closeNewImplementation = useCallback(() => setIsNewImplementationOpen(false), [])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={boards.titles[board]}
        description={boards.descriptions[board]}
        actions={
          board === 'implementation' && (
            <Button variant="secondary" onClick={() => setIsNewImplementationOpen(true)}>
              <Plus aria-hidden="true" className="size-4" />
              {boards.newCard}
            </Button>
          )
        }
      />
      {/* The key remounts the board so each board loads its own data and subscriptions. */}
      <BoardScreen
        key={board}
        board={board}
        currentUserId={currentUserId}
        isNewImplementationOpen={board === 'implementation' && isNewImplementationOpen}
        onCloseNewImplementation={closeNewImplementation}
      />
    </div>
  )
}
