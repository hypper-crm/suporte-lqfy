import { Plus } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { useClients } from '../../hooks/useClients'
import { clients as clientStrings, common } from '../../i18n/pt-BR'
import type { Client } from '../../types/database'
import { PageHeader } from '../layout/PageHeader'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Drawer } from '../ui/Drawer'
import { SearchField } from '../ui/SearchField'
import { StatusMessage } from '../ui/StatusMessage'
import { ClientCardList } from './ClientCardList'
import { ClientFormDrawer } from './ClientFormDrawer'
import { ClientTable } from './ClientTable'
import { ClientTableSkeleton } from './ClientTableSkeleton'

type FormState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; clientId: string }

function matchesSearch(client: Client, normalizedSearch: string): boolean {
  if (!normalizedSearch) return true
  return (
    client.name.toLowerCase().includes(normalizedSearch) ||
    client.emails.some((email) => email.email.toLowerCase().includes(normalizedSearch))
  )
}

type EmptyStateProps = {
  message: string
}

function EmptyState({ message }: EmptyStateProps) {
  return (
    <Card className="flex items-center justify-center px-6 py-14">
      <p className="text-sm text-muted">{message}</p>
    </Card>
  )
}

export function ClientsScreen() {
  const { clients, isLoading, loadErrorMessage, isRealtimeDisconnected, reload, createClient, updateClient, deleteClient } =
    useClients()
  const [searchText, setSearchText] = useState('')
  const [formState, setFormState] = useState<FormState>({ mode: 'closed' })

  const normalizedSearch = searchText.trim().toLowerCase()
  const visibleClients = useMemo(
    () => clients.filter((client) => matchesSearch(client, normalizedSearch)),
    [clients, normalizedSearch],
  )

  const closeForm = useCallback(() => setFormState({ mode: 'closed' }), [])

  function renderForm() {
    if (formState.mode === 'create') {
      return <ClientFormDrawer key="create" client={null} onSave={createClient} onClose={closeForm} />
    }
    if (formState.mode === 'edit') {
      const client = clients.find((current) => current.id === formState.clientId)
      if (!client) {
        return (
          <Drawer key="missing" title={clientStrings.notFoundTitle} onClose={closeForm}>
            <StatusMessage variant="info">{clientStrings.notFoundMessage}</StatusMessage>
            <Button onClick={closeForm} className="self-start">
              {common.close}
            </Button>
          </Drawer>
        )
      }
      return (
        <ClientFormDrawer
          key={client.id}
          client={client}
          onSave={(input, coverChange) => updateClient(client, input, coverChange)}
          onDelete={async () => {
            await deleteClient(client)
            closeForm()
          }}
          onClose={closeForm}
        />
      )
    }
    return null
  }

  function renderContent() {
    if (isLoading) return <ClientTableSkeleton />

    if (loadErrorMessage) {
      return (
        <div className="flex flex-col items-start gap-2">
          <StatusMessage variant="error">{loadErrorMessage}</StatusMessage>
          <Button variant="link" onClick={reload}>
            {common.tryAgain}
          </Button>
        </div>
      )
    }

    if (clients.length === 0) return <EmptyState message={clientStrings.empty} />

    if (visibleClients.length === 0) return <EmptyState message={clientStrings.noMatches(searchText.trim())} />

    const selectClient = (clientId: string) => setFormState({ mode: 'edit', clientId })
    return (
      <>
        <div className="md:hidden">
          <ClientCardList clients={visibleClients} onSelectClient={selectClient} />
        </div>
        <div className="max-md:hidden">
          <ClientTable clients={visibleClients} onSelectClient={selectClient} />
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-1 flex-col md:min-h-0 md:overflow-y-auto">
      <PageHeader
        title={clientStrings.title}
        description={clientStrings.description}
        actions={
          <Button variant="secondary" onClick={() => setFormState({ mode: 'create' })}>
            <Plus aria-hidden="true" className="size-4" />
            {clientStrings.newClient}
          </Button>
        }
      />
      <div className="flex flex-col gap-4 px-4 md:px-8 pb-8">
        <SearchField
          aria-label={clientStrings.searchLabel}
          placeholder={clientStrings.searchPlaceholder}
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        {isRealtimeDisconnected && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusMessage variant="info">{clientStrings.realtimePaused}</StatusMessage>
            <Button variant="link" onClick={reload}>
              {common.reload}
            </Button>
          </div>
        )}
        {renderContent()}
      </div>
      <AnimatePresence>{renderForm()}</AnimatePresence>
    </div>
  )
}
