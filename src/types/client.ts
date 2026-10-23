import type { RealtimeHandlers } from './board'
import type { Client } from './database'

// Values written to the `clients` table when creating or editing a client.
export type ClientInput = {
  name: string
  email: string | null
  niche: string | null
  payInRate: number | null
  payOutRate: number | null
}

export type ClientRealtimeHandlers = RealtimeHandlers<Client>
