import { useCallback, useEffect, useState } from 'react'
import {
  defaultOverdueAfterDays,
  fetchTeamSettings,
  subscribeToTeamSettingsChanges,
  updateOverdueAfterDays,
} from '../services/settingsService'

export type TeamSettingsState = {
  // The default value until the settings are loaded.
  overdueAfterDays: number
  isLoading: boolean
  loadErrorMessage: string | null
  isRealtimeDisconnected: boolean
  reload: () => void
  saveOverdueAfterDays: (overdueAfterDays: number) => Promise<void>
}

export function useTeamSettings(): TeamSettingsState {
  const [overdueAfterDays, setOverdueAfterDays] = useState(defaultOverdueAfterDays)
  const [isLoading, setIsLoading] = useState(true)
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null)
  const [isRealtimeDisconnected, setIsRealtimeDisconnected] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    return subscribeToTeamSettingsChanges({
      onUpsert: (settings) => setOverdueAfterDays(settings.overdue_after_days),
      onDelete: () => setOverdueAfterDays(defaultOverdueAfterDays),
      onConnectionChange: (isConnected) => setIsRealtimeDisconnected(!isConnected),
    })
  }, [])

  useEffect(() => {
    let isActive = true
    setIsLoading(true)
    setLoadErrorMessage(null)

    fetchTeamSettings()
      .then((settings) => {
        if (isActive) setOverdueAfterDays(settings.overdue_after_days)
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

  const saveOverdueAfterDays = useCallback(async (days: number) => {
    const settings = await updateOverdueAfterDays(days)
    setOverdueAfterDays(settings.overdue_after_days)
  }, [])

  return { overdueAfterDays, isLoading, loadErrorMessage, isRealtimeDisconnected, reload, saveOverdueAfterDays }
}
