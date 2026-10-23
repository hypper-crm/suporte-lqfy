import { useCallback, useEffect, useMemo, useState } from 'react'
import { compareByPosition, positionAfterLast } from '../lib/cardPosition'
import { applyPatch, removeById, replacePatchedRow, revertPatch, upsertById } from '../lib/rows'
import {
  createStepTemplate,
  deleteStepTemplate as deleteStepTemplateRequest,
  listStepTemplates,
  moveStepTemplate as moveStepTemplateRequest,
  renameStepTemplate as renameStepTemplateRequest,
  subscribeToStepTemplateChanges,
} from '../services/stepTemplateService'
import type { ImplementationStepTemplate } from '../types/database'

export type StepTemplatesState = {
  stepTemplates: ImplementationStepTemplate[]
  isLoading: boolean
  loadErrorMessage: string | null
  moveErrorMessage: string | null
  isRealtimeDisconnected: boolean
  reload: () => void
  dismissMoveError: () => void
  addStepTemplate: (title: string) => Promise<void>
  renameStepTemplate: (stepTemplateId: string, title: string) => Promise<void>
  deleteStepTemplate: (stepTemplateId: string) => Promise<void>
  moveStepTemplate: (stepTemplateId: string, position: number) => void
}

export function useStepTemplates(): StepTemplatesState {
  const [unsortedStepTemplates, setStepTemplates] = useState<ImplementationStepTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null)
  const [moveErrorMessage, setMoveErrorMessage] = useState<string | null>(null)
  const [isRealtimeDisconnected, setIsRealtimeDisconnected] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  const stepTemplates = useMemo(() => [...unsortedStepTemplates].sort(compareByPosition), [unsortedStepTemplates])

  useEffect(() => {
    return subscribeToStepTemplateChanges({
      onUpsert: (stepTemplate) => setStepTemplates((current) => upsertById(current, stepTemplate)),
      onDelete: (stepTemplateId) => setStepTemplates((current) => removeById(current, stepTemplateId)),
      onConnectionChange: (isConnected) => setIsRealtimeDisconnected(!isConnected),
    })
  }, [])

  useEffect(() => {
    let isActive = true
    setIsLoading(true)
    setLoadErrorMessage(null)

    listStepTemplates()
      .then((loadedStepTemplates) => {
        if (isActive) setStepTemplates(loadedStepTemplates)
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
  }, [reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  const dismissMoveError = useCallback(() => setMoveErrorMessage(null), [])

  const addStepTemplate = useCallback(
    async (title: string) => {
      const createdStepTemplate = await createStepTemplate(title, positionAfterLast(unsortedStepTemplates))
      setStepTemplates((current) => upsertById(current, createdStepTemplate))
    },
    [unsortedStepTemplates],
  )

  const renameStepTemplate = useCallback(async (stepTemplateId: string, title: string) => {
    const renamedStepTemplate = await renameStepTemplateRequest(stepTemplateId, title)
    setStepTemplates((current) => upsertById(current, renamedStepTemplate))
  }, [])

  const deleteStepTemplate = useCallback(async (stepTemplateId: string) => {
    await deleteStepTemplateRequest(stepTemplateId)
    setStepTemplates((current) => removeById(current, stepTemplateId))
  }, [])

  const moveStepTemplate = useCallback(
    (stepTemplateId: string, position: number) => {
      const previousStepTemplate = unsortedStepTemplates.find((stepTemplate) => stepTemplate.id === stepTemplateId)
      if (!previousStepTemplate) return
      const patch = { position }

      setMoveErrorMessage(null)
      setStepTemplates((current) => applyPatch(current, stepTemplateId, patch))
      moveStepTemplateRequest(stepTemplateId, position)
        .then((savedStepTemplate) => setStepTemplates((current) => replacePatchedRow(current, savedStepTemplate, patch)))
        .catch((error: Error) => {
          setMoveErrorMessage(error.message)
          setStepTemplates((current) => revertPatch(current, previousStepTemplate, patch))
        })
    },
    [unsortedStepTemplates],
  )

  return {
    stepTemplates,
    isLoading,
    loadErrorMessage,
    moveErrorMessage,
    isRealtimeDisconnected,
    reload,
    dismissMoveError,
    addStepTemplate,
    renameStepTemplate,
    deleteStepTemplate,
    moveStepTemplate,
  }
}
