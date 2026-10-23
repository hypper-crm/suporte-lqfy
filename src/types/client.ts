import type { RealtimeHandlers } from './board'
import type { ClientEmail, ClientRow } from './database'

// An email of the client form. The id is null for an email that was not saved yet.
export type ClientEmailInput = {
  id: string | null
  email: string
}

// Values written to the `clients` and `client_emails` tables when creating or editing a client.
export type ClientInput = {
  name: string
  // In display order, saved as `position`.
  emails: ClientEmailInput[]
  niche: string | null
  payInRate: number | null
  payOutRate: number | null
  website: string | null
}

// What happens to the cover image when a client is saved.
export type ClientCoverChange = { kind: 'keep' } | { kind: 'replace'; file: File; mimeType: string } | { kind: 'remove' }

// Realtime rows of `clients` arrive without their emails.
export type ClientRealtimeHandlers = RealtimeHandlers<ClientRow>

export type ClientEmailRealtimeHandlers = RealtimeHandlers<ClientEmail>
