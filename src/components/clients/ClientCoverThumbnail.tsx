type ClientCoverThumbnailProps = {
  coverImageUrl: string | null
}

// Nothing is shown when the client has no cover.
export function ClientCoverThumbnail({ coverImageUrl }: ClientCoverThumbnailProps) {
  if (!coverImageUrl) return null
  return <img src={coverImageUrl} alt="" loading="lazy" className="h-8 w-12 shrink-0 rounded-md border border-border object-cover" />
}
