import { serviceErrors } from '../i18n/pt-BR'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'
import { getPublicUrl, removePublicFiles } from './publicStorage'

const profileFields = 'id, full_name, avatar_url, created_at'

const avatarBucketName = 'avatars'

const avatarExtensions = ['png', 'jpg', 'webp']

function optionalString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function toProfile(record: Record<string, unknown>): Profile {
  return {
    id: String(record.id),
    full_name: optionalString(record.full_name),
    avatar_url: optionalString(record.avatar_url),
    created_at: String(record.created_at),
  }
}

export async function getProfileById(profileId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(profileFields)
    .eq('id', profileId)
    .maybeSingle()
  if (error) throw new Error(serviceErrors.profileLoad)
  return data ? toProfile(data) : null
}

export async function listProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select(profileFields).order('full_name', { ascending: true })
  if (error) throw new Error(serviceErrors.profilesLoad)
  return data.map(toProfile)
}

type AvatarUpload = {
  profileId: string
  file: File
  mimeType: string
  // Without the dot, for example "png".
  extension: string
}

// Saves the photo to "<user_id>/avatar.<ext>" and stores its public URL on the profile.
export async function uploadAvatar({ profileId, file, mimeType, extension }: AvatarUpload): Promise<Profile> {
  const storagePath = `${profileId}/avatar.${extension}`
  const { error: uploadError } = await supabase.storage
    .from(avatarBucketName)
    .upload(storagePath, file, { contentType: mimeType, upsert: true })
  if (uploadError) throw new Error(serviceErrors.avatarUpload)

  // The path stays the same when the photo is replaced, so a version query string makes browsers load the new file.
  const avatarUrl = `${getPublicUrl(avatarBucketName, storagePath)}?v=${Date.now()}`
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', profileId)
    .select(profileFields)
    .maybeSingle()
  if (error || !data) throw new Error(serviceErrors.avatarSave)

  // A photo saved earlier with another extension is no longer used.
  await removePublicFiles(
    avatarBucketName,
    avatarExtensions.filter((otherExtension) => otherExtension !== extension).map((otherExtension) => `${profileId}/avatar.${otherExtension}`),
  )
  return toProfile(data)
}
