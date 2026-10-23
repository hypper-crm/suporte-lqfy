import { useCallback, useEffect, useState } from 'react'
import { header } from '../i18n/pt-BR'
import { getProfileById, uploadAvatar as uploadAvatarRequest } from '../services/profileService'
import type { Profile } from '../types/database'

export type ProfileState = {
  profile: Profile | null
  isLoading: boolean
  errorMessage: string | null
  reload: () => void
  uploadAvatar: (file: File, mimeType: string, extension: string) => Promise<void>
}

export function useProfile(profileId: string | null): ProfileState {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    if (!profileId) {
      setProfile(null)
      setErrorMessage(null)
      return
    }

    let isActive = true
    setIsLoading(true)
    setErrorMessage(null)

    getProfileById(profileId)
      .then((loadedProfile) => {
        if (!isActive) return
        setProfile(loadedProfile)
        if (!loadedProfile) setErrorMessage(header.profileNotFound)
      })
      .catch((error: Error) => {
        if (isActive) setErrorMessage(error.message)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [profileId, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  const uploadAvatar = useCallback(
    async (file: File, mimeType: string, extension: string) => {
      if (!profileId) return
      setProfile(await uploadAvatarRequest({ profileId, file, mimeType, extension }))
    },
    [profileId],
  )

  return { profile, isLoading, errorMessage, reload, uploadAvatar }
}
