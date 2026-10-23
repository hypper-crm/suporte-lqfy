import { AnimatePresence, motion } from 'motion/react'
import { clients as clientStrings, common } from '../../i18n/pt-BR'
import { formatRate } from '../../lib/formatting'
import type { Client } from '../../types/database'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { stateTransition } from '../ui/motionPresets'
import { ClientCoverThumbnail } from './ClientCoverThumbnail'
import { ClientEmailSummary } from './ClientEmailSummary'
import { ClientWebsiteLink } from './ClientWebsiteLink'

type ClientCardListProps = {
  clients: Client[]
  onSelectClient: (clientId: string) => void
}

// Replaces the client table below the md breakpoint.
export function ClientCardList({ clients, onSelectClient }: ClientCardListProps) {
  return (
    <ul aria-label={clientStrings.title} className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {clients.map((client) => (
          <motion.li key={client.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={stateTransition}>
            <Card className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <ClientCoverThumbnail coverImageUrl={client.cover_image_url} />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate font-medium">{client.name}</p>
                    <ClientEmailSummary emails={client.emails} className="text-sm" />
                  </div>
                </div>
                <Button variant="ghost" size="small" onClick={() => onSelectClient(client.id)} aria-label={clientStrings.editLabel(client.name)}>
                  {common.edit}
                </Button>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-3">
                <div className="col-span-2 flex min-w-0 flex-col gap-1">
                  <dt className="section-label">{clientStrings.columns.niche}</dt>
                  <dd className="min-w-0">
                    {client.niche ? <Badge>{client.niche}</Badge> : <span className="text-sm text-subtle">{common.emptyValue}</span>}
                  </dd>
                </div>
                <div className="col-span-2 flex min-w-0 flex-col gap-1">
                  <dt className="section-label">{clientStrings.columns.website}</dt>
                  <dd className="min-w-0 text-sm">
                    <ClientWebsiteLink clientName={client.name} website={client.website} />
                  </dd>
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <dt className="section-label truncate">{clientStrings.columns.payInRate}</dt>
                  <dd className="text-sm font-medium">{formatRate(client.pay_in_rate)}</dd>
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <dt className="section-label truncate">{clientStrings.columns.payOutRate}</dt>
                  <dd className="text-sm font-medium">{formatRate(client.pay_out_rate)}</dd>
                </div>
              </dl>
            </Card>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
