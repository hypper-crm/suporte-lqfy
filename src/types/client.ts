import type { RealtimeHandlers } from './board'
import type { Client } from './database'

// Values written to the `clients` table when creating or editing a client.
export type ClientInput = {
  name: string
  email: string | null
  niche: string | null
  payInRate: number | null
  payOutRate: number | null
  website: string | null
}

// What happens to the cover image when a client is saved.
export type ClientCoverChange = { kind: 'keep' } | { kind: 'replace'; file: File; mimeType: string } | { kind: 'remove' }

export type ClientRealtimeHandlers = RealtimeHandlers<Client>
