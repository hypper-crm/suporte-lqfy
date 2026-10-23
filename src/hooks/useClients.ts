import { useCallback, useEffect, useState } from 'react'
import {
  createClient as createClientRequest,
  deleteClient as deleteClientRequest,
  listClients,
  sortClientEmails,
  subscribeToClientChanges,
  subscribeToClientEmailChanges,
  updateClient as updateClientRequest,
} from '../services/clientService'
import type { ClientCoverChange, ClientInput } from '../types/client'
import type { Client, ClientEmail, ClientRow } from '../types/database'

export type ClientsState = {
  clients: Client[]
  isLoading: boolean
  loadErrorMessage: string | null
  isRealtimeDisconnected: boolean
  reload: () => void
  createClient: (input: ClientInput, coverChange: ClientCoverChange) => Promise<Client>
  updateClient: (client: Client, input: ClientInput, coverChange: ClientCoverChange) => Promise<void>
  deleteClient: (client: Client) => Promise<void>
}

function sortByName(clients: Client[]): Client[] {
  return [...clients].sort((first, second) => first.name.localeCompare(second.name, undefined, { sensitivity: 'base' }))
}

function upsertClient(clients: Client[], client: Client): Client[] {
  const exists = clients.some((current) => current.id === client.id)
  return sortByName(exists ? clients.map((current) => (current.id === client.id ? client : current)) : [...clients, client])
}

// Realtime rows of `clients` have no emails, so the emails already loaded are kept.
function upsertClientRow(clients: Client[], row: ClientRow): Client[] {
  const current = clients.find((client) => client.id === row.id)
  return upsertClient(clients, { ...row, emails: current?.emails ?? [] })
}

function upsertClientEmail(clients: Client[], email: ClientEmail): Client[] {
  return clients.map((client) => {
    if (client.id !== email.client_id) return client
    return { ...client, emails: sortClientEmails([...client.emails.filter((current) => current.id !== email.id), email]) }
  })
}

// Delete events only carry the id, so every client is checked.
function removeClientEmail(clients: Client[], emailId: string): Client[] {
  return clients.map((client) =>
    client.emails.some((email) => email.id === emailId)
      ? { ...client, emails: client.emails.filter((email) => email.id !== emailId) }
      : client,
  )
}

function removeClient(clients: Client[], clientId: string): Client[] {
  return clients.filter((client) => client.id !== clientId)
}

export function useClients(): ClientsState {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null)
  const [isClientsRealtimeDisconnected, setIsClientsRealtimeDisconnected] = useState(false)
  const [isEmailsRealtimeDisconnected, setIsEmailsRealtimeDisconnected] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    return subscribeToClientChanges({
      onUpsert: (row) => setClients((current) => upsertClientRow(current, row)),
      onDelete: (clientId) => setClients((current) => removeClient(current, clientId)),
      onConnectionChange: (isConnected) => setIsClientsRealtimeDisconnected(!isConnected),
    })
  }, [])

  useEffect(() => {
    return subscribeToClientEmailChanges({
      onUpsert: (email) => setClients((current) => upsertClientEmail(current, email)),
      onDelete: (emailId) => setClients((current) => removeClientEmail(current, emailId)),
      onConnectionChange: (isConnected) => setIsEmailsRealtimeDisconnected(!isConnected),
    })
  }, [])

  useEffect(() => {
    let isActive = true
    setIsLoading(true)
    setLoadErrorMessage(null)

    listClients()
      .then((loadedClients) => {
        if (isActive) setClients(sortByName(loadedClients))
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

  const createClient = useCallback(async (input: ClientInput, coverChange: ClientCoverChange) => {
    const createdClient = await createClientRequest(input, coverChange)
    setClients((current) => upsertClient(current, createdClient))
    return createdClient
  }, [])

  const updateClient = useCallback(async (client: Client, input: ClientInput, coverChange: ClientCoverChange) => {
    const updatedClient = await updateClientRequest(client, input, coverChange)
    setClients((current) => upsertClient(current, updatedClient))
  }, [])

  const deleteClient = useCallback(async (client: Client) => {
    await deleteClientRequest(client)
    setClients((current) => removeClient(current, client.id))
  }, [])

  const isRealtimeDisconnected = isClientsRealtimeDisconnected || isEmailsRealtimeDisconnected

  return { clients, isLoading, loadErrorMessage, isRealtimeDisconnected, reload, createClient, updateClient, deleteClient }
}
