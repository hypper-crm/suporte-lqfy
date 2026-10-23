import { useCallback, useEffect, useMemo, useState } from 'react'
import { compareByPosition, positionAfterLast } from '../lib/cardPosition'
import { applyPatch, removeById, replacePatchedRow, revertPatch, upsertById } from '../lib/rows'
import {
  createCardTask,
  deleteCardTask,
  listAllCardTasks,
  moveCardTask,
  renameCardTask,
  setCardTaskCompletion,
  subscribeToCardTaskChanges,
} from '../services/cardTaskService'
import type { CardTask } from '../types/database'

export type TaskProgress = {
  doneCount: number
  totalCount: number
}

// Checklist operations for one card, as used by the implementation card drawer.
export type CardChecklistActions = {
  toggleTask: (task: CardTask) => void
  addTask: (cardId: string, title: string) => Promise<void>
  renameTask: (taskId: string, title: string) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  moveTask: (taskId: string, position: number) => void
}

export type CardTasksState = CardChecklistActions & {
  // Tasks of each card, sorted by position.
  tasksByCardId: Map<string, CardTask[]>
  progressByCardId: Map<string, TaskProgress>
  isLoading: boolean
  loadErrorMessage: string | null
  // Set when an optimistic change (check, uncheck or reorder) failed and was undone.
  updateErrorMessage: string | null
  isRealtimeDisconnected: boolean
  reload: () => void
  dismissUpdateError: () => void
  // Adds tasks created elsewhere in the app, such as the checklist of a new card.
  receiveTasks: (tasks: CardTask[]) => void
}

const emptyTasksByCardId = new Map<string, CardTask[]>()

// Holds the checklists of every implementation card. Inactive (no requests, no subscription) when `isEnabled` is false.
export function useCardTasks(isEnabled: boolean, currentUserId: string): CardTasksState {
  const [tasks, setTasks] = useState<CardTask[]>([])
  const [isLoading, setIsLoading] = useState(isEnabled)
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null)
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(null)
  const [isRealtimeDisconnected, setIsRealtimeDisconnected] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    if (!isEnabled) return
    return subscribeToCardTaskChanges({
      onUpsert: (task) => setTasks((current) => upsertById(current, task)),
      onDelete: (taskId) => setTasks((current) => removeById(current, taskId)),
      onConnectionChange: (isConnected) => setIsRealtimeDisconnected(!isConnected),
    })
  }, [isEnabled])

  useEffect(() => {
    if (!isEnabled) return

    let isActive = true
    setIsLoading(true)
    setLoadErrorMessage(null)

    listAllCardTasks()
      .then((loadedTasks) => {
        if (isActive) setTasks(loadedTasks)
      })
      .catch((error: Error) => {
        if (isActive) setLoadErrorMessage(error.message)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [isEnabled, reloadCount])

  const tasksByCardId = useMemo(() => {
    if (tasks.length === 0) return emptyTasksByCardId
    const grouped = new Map<string, CardTask[]>()
    for (const task of [...tasks].sort(compareByPosition)) {
      const cardTasks = grouped.get(task.card_id)
      if (cardTasks) cardTasks.push(task)
      else grouped.set(task.card_id, [task])
    }
    return grouped
  }, [tasks])

  const progressByCardId = useMemo(
    () =>
      new Map(
        [...tasksByCardId].map(([cardId, cardTasks]) => [
          cardId,
          { doneCount: cardTasks.filter((task) => task.is_done).length, totalCount: cardTasks.length },
        ]),
      ),
    [tasksByCardId],
  )

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  const dismissUpdateError = useCallback(() => setUpdateErrorMessage(null), [])

  const receiveTasks = useCallback((receivedTasks: CardTask[]) => {
    setTasks((current) => receivedTasks.reduce(upsertById, current))
  }, [])

  const updateOptimistically = useCallback(
    (previousTask: CardTask, patch: Partial<CardTask>, request: () => Promise<CardTask>) => {
      setUpdateErrorMessage(null)
      setTasks((current) => applyPatch(current, previousTask.id, patch))
      request()
        .then((savedTask) => setTasks((current) => replacePatchedRow(current, savedTask, patch)))
        .catch((error: Error) => {
          setUpdateErrorMessage(error.message)
          setTasks((current) => revertPatch(current, previousTask, patch))
        })
    },
    [],
  )

  const toggleTask = useCallback(
    (task: CardTask) => {
      const isDone = !task.is_done
      const completion = {
        isDone,
        completedAt: isDone ? new Date().toISOString() : null,
        completedBy: isDone ? currentUserId : null,
      }
      updateOptimistically(
        task,
        { is_done: completion.isDone, completed_at: completion.completedAt, completed_by: completion.completedBy },
        () => setCardTaskCompletion(task.id, completion),
      )
    },
    [currentUserId, updateOptimistically],
  )

  const moveTask = useCallback(
    (taskId: string, position: number) => {
      const previousTask = tasks.find((task) => task.id === taskId)
      if (previousTask) updateOptimistically(previousTask, { position }, () => moveCardTask(taskId, position))
    },
    [tasks, updateOptimistically],
  )

  const addTask = useCallback(
    async (cardId: string, title: string) => {
      const position = positionAfterLast(tasks.filter((task) => task.card_id === cardId))
      const createdTask = await createCardTask({ cardId, title, position })
      setTasks((current) => upsertById(current, createdTask))
    },
    [tasks],
  )

  const renameTask = useCallback(async (taskId: string, title: string) => {
    const renamedTask = await renameCardTask(taskId, title)
    setTasks((current) => upsertById(current, renamedTask))
  }, [])

  const deleteTask = useCallback(async (taskId: string) => {
    await deleteCardTask(taskId)
    setTasks((current) => removeById(current, taskId))
  }, [])

  return {
    tasksByCardId,
    progressByCardId,
    isLoading: isEnabled && isLoading,
    loadErrorMessage,
    updateErrorMessage,
    isRealtimeDisconnected: isEnabled && isRealtimeDisconnected,
    reload,
    dismissUpdateError,
    receiveTasks,
    toggleTask,
    addTask,
    renameTask,
    deleteTask,
    moveTask,
  }
}
