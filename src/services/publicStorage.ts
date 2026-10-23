import { supabase } from '../lib/supabase'

// Helpers for the public buckets, whose files are referenced by their public URL.

export function getPublicUrl(bucketName: string, storagePath: string): string {
  return supabase.storage.from(bucketName).getPublicUrl(storagePath).data.publicUrl
}

// Returns the storage path of a public URL from the given bucket, or null for any other URL.
export function toStoragePath(bucketName: string, publicUrl: string): string | null {
  const bucketPrefix = getPublicUrl(bucketName, '')
  if (!publicUrl.startsWith(bucketPrefix)) return null
  const storagePath = publicUrl.slice(bucketPrefix.length).split(/[?#]/)[0]
  return storagePath ? decodeURIComponent(storagePath) : null
}

// Best effort: a file left behind is not referenced by the app anymore, so a failure here is not reported.
export async function removePublicFiles(bucketName: string, storagePaths: string[]): Promise<void> {
  if (storagePaths.length === 0) return
  await supabase.storage.from(bucketName).remove(storagePaths)
}
