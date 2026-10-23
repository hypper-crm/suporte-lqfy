import { useEffect, useMemo, useRef, useState } from 'react'
import { coverUrlExpiryInSeconds, getAttachmentStoragePaths, getCoverUrls } from '../services/attachmentService'
import type { Card } from '../types/database'

// Links are renewed this long before they expire, so a cover never points to an expired link.
const renewalMarginInMilliseconds = 5 * 60 * 1000

// A cover that could not be signed is tried again after this delay.
const retryDelayInMilliseconds = 60 * 1000

type SignedCover = {
  // Null when the link could not be created.
  url: string | null
  expiresAt: number
}

// Signed cover links keyed by attachment id: a URL, null when the link could not be created,
// or missing while the link is being created.
export type CoverUrls = Record<string, string | null>

// Marked as due for renewal once the retry delay has passed.
function toFailedCover(): SignedCover {
  return { url: null, expiresAt: Date.now() + renewalMarginInMilliseconds + retryDelayInMilliseconds }
}

function needsSigning(signedCover: SignedCover | undefined, now: number): boolean {
  return !signedCover || signedCover.expiresAt - renewalMarginInMilliseconds <= now
}

function keepOnly(signedCovers: Record<string, SignedCover>, attachmentIds: string[]): Record<string, SignedCover> {
  const hasExtraCovers = Object.keys(signedCovers).some((attachmentId) => !attachmentIds.includes(attachmentId))
  if (!hasExtraCovers) return signedCovers
  return Object.fromEntries(attachmentIds.flatMap((attachmentId) => (signedCovers[attachmentId] ? [[attachmentId, signedCovers[attachmentId]]] : [])))
}

// Keeps a signed link for the cover of every card on the board, in memory.
// Covers that need a link are signed together in one request, and renewed before they expire.
export function useCardCovers(cards: Card[]): CoverUrls {
  const [signedCovers, setSignedCovers] = useState<Record<string, SignedCover>>({})
  const [renewalCount, setRenewalCount] = useState(0)
  // Storage paths keyed by attachment id. They never change, so they are only looked up once.
  const storagePathsRef = useRef<Record<string, string>>({})
  const signedCoversRef = useRef(signedCovers)
  signedCoversRef.current = signedCovers

  // A stable key, so links are only requested when the set of covers changes or a renewal is due.
  const coverIdsKey = useMemo(
    () => [...new Set(cards.flatMap((card) => (card.cover_attachment_id ? [card.cover_attachment_id] : [])))].sort().join(','),
    [cards],
  )

  useEffect(() => {
    const attachmentIds = coverIdsKey ? coverIdsKey.split(',') : []
    setSignedCovers((current) => keepOnly(current, attachmentIds))

    const now = Date.now()
    const idsToSign = attachmentIds.filter((attachmentId) => needsSigning(signedCoversRef.current[attachmentId], now))
    if (idsToSign.length === 0) return

    let isActive = true

    async function signCovers(): Promise<Record<string, SignedCover>> {
      const unknownIds = idsToSign.filter((attachmentId) => !storagePathsRef.current[attachmentId])
      if (unknownIds.length > 0) {
        Object.assign(storagePathsRef.current, await getAttachmentStoragePaths(unknownIds))
      }
      const storagePaths = idsToSign.flatMap((attachmentId) => storagePathsRef.current[attachmentId] ?? [])
      const urlsByPath = storagePaths.length > 0 ? await getCoverUrls(storagePaths) : {}
      const expiresAt = Date.now() + coverUrlExpiryInSeconds * 1000
      return Object.fromEntries(
        idsToSign.map((attachmentId) => {
          const url = urlsByPath[storagePathsRef.current[attachmentId]] ?? null
          return [attachmentId, url ? { url, expiresAt } : toFailedCover()]
        }),
      )
    }

    signCovers()
      .catch(() => Object.fromEntries(idsToSign.map((attachmentId) => [attachmentId, toFailedCover()])))
      .then((newCovers) => {
        if (isActive) setSignedCovers((current) => ({ ...current, ...newCovers }))
      })

    return () => {
      isActive = false
    }
  }, [coverIdsKey, renewalCount])

  // Wakes up when the first link is due for renewal.
  useEffect(() => {
    const expiryTimes = Object.values(signedCovers).map((signedCover) => signedCover.expiresAt)
    if (expiryTimes.length === 0) return
    const delay = Math.max(0, Math.min(...expiryTimes) - renewalMarginInMilliseconds - Date.now())
    const timeoutId = window.setTimeout(() => setRenewalCount((count) => count + 1), delay)
    return () => window.clearTimeout(timeoutId)
  }, [signedCovers])

  return useMemo(
    () => Object.fromEntries(Object.entries(signedCovers).map(([attachmentId, signedCover]) => [attachmentId, signedCover.url])),
    [signedCovers],
  )
}
