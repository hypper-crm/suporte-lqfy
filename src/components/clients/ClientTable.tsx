import { AnimatePresence } from 'motion/react'
import { clients as clientStrings, common } from '../../i18n/pt-BR'
import { formatRate } from '../../lib/formatting'
import type { Client } from '../../types/database'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Table, TableCell, TableHeaderCell, TableRow } from '../ui/Table'
import { ClientCoverThumbnail } from './ClientCoverThumbnail'
import { ClientWebsiteLink } from './ClientWebsiteLink'

type ClientTableProps = {
  clients: Client[]
  onSelectClient: (clientId: string) => void
}

export function ClientTable({ clients, onSelectClient }: ClientTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <TableHeaderCell>{clientStrings.columns.name}</TableHeaderCell>
          <TableHeaderCell>{clientStrings.columns.email}</TableHeaderCell>
          <TableHeaderCell>{clientStrings.columns.niche}</TableHeaderCell>
          <TableHeaderCell>{clientStrings.columns.website}</TableHeaderCell>
          <TableHeaderCell align="right">{clientStrings.columns.payInRate}</TableHeaderCell>
          <TableHeaderCell align="right">{clientStrings.columns.payOutRate}</TableHeaderCell>
          <TableHeaderCell align="right">
            <span className="sr-only">{clientStrings.columns.actions}</span>
          </TableHeaderCell>
        </tr>
      </thead>
      <tbody>
        <AnimatePresence initial={false}>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <ClientCoverThumbnail coverImageUrl={client.cover_image_url} />
                  <button
                    type="button"
                    onClick={() => onSelectClient(client.id)}
                    className="rounded text-left font-medium outline-none transition-colors duration-200 ease-fluid hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                    {client.name}
                  </button>
                </div>
              </TableCell>
              <TableCell className={client.email ? 'text-muted' : 'text-subtle'}>{client.email ?? common.emptyValue}</TableCell>
              <TableCell>{client.niche ? <Badge>{client.niche}</Badge> : <span className="text-subtle">{common.emptyValue}</span>}</TableCell>
              <TableCell className="max-w-56">
                <ClientWebsiteLink clientName={client.name} website={client.website} />
              </TableCell>
              <TableCell align="right" className="font-medium">
                {formatRate(client.pay_in_rate)}
              </TableCell>
              <TableCell align="right" className="font-medium">
                {formatRate(client.pay_out_rate)}
              </TableCell>
              <TableCell align="right">
                <Button variant="ghost" size="small" onClick={() => onSelectClient(client.id)} aria-label={clientStrings.editLabel(client.name)}>
                  {common.edit}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </AnimatePresence>
      </tbody>
    </Table>
  )
}
