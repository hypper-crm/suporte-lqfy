import { useCallback, useEffect, useState } from 'react'
import {
  createClient as createClientRequest,
  deleteClient as deleteClientRequest,
  listClients,
  subscribeToClientChanges,
  updateClient as updateClientRequest,
} from '../services/clientService'
import type { ClientCoverChange, ClientInput } from '../types/client'
import type { Client } from '../types/database'

export type ClientsState = {
  clients: Client[]
  isLoading: boolean
  loadErrorMessage: string | null
  isRealtimeDisconnected: boolean
  reload: () => void
  createClient: (input: ClientInput, coverChange: ClientCoverChange) => Promise<void>
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

function removeClient(clients: Client[], clientId: string): Client[] {
  return clients.filter((client) => client.id !== clientId)
}

export function useClients(): ClientsState {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null)
  const [isRealtimeDisconnected, setIsRealtimeDisconnected] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    return subscribeToClientChanges({
      onUpsert: (client) => setClients((current) => upsertClient(current, client)),
      onDelete: (clientId) => setClients((current) => removeClient(current, clientId)),
      onConnectionChange: (isConnected) => setIsRealtimeDisconnected(!isConnected),
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
  }, [])

  const updateClient = useCallback(async (client: Client, input: ClientInput, coverChange: ClientCoverChange) => {
    const updatedClient = await updateClientRequest(client, input, coverChange)
    setClients((current) => upsertClient(current, updatedClient))
  }, [])

  const deleteClient = useCallback(async (client: Client) => {
    await deleteClientRequest(client)
    setClients((current) => removeClient(current, client.id))
  }, [])

  return { clients, isLoading, loadErrorMessage, isRealtimeDisconnected, reload, createClient, updateClient, deleteClient }
}
