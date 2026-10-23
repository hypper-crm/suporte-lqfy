import { cardDetails, common } from '../../i18n/pt-BR'
import { formatRate } from '../../lib/formatting'
import type { Client } from '../../types/database'
import { Card } from '../../components/ui/Card'
import { ClientWebsiteLink } from '../../components/clients/ClientWebsiteLink'

type ClientInfoPanelProps = {
  client: Client | undefined
}

export function ClientInfoPanel({ client }: ClientInfoPanelProps) {
  return (
    <Card isElevated className="flex flex-col gap-3 p-4">
      <h3 className="section-label">{cardDetails.clientPanel.title}</h3>
      {client?.cover_image_url && (
        <img
          src={client.cover_image_url}
          alt={cardDetails.clientPanel.coverAlt(client.name)}
          className="aspect-[3/1] w-full rounded-lg border border-border object-cover"
        />
      )}
      {client ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted">{cardDetails.clientPanel.name}</dt>
          <dd className="font-medium break-words">{client.name}</dd>
          <dt className="text-muted">{cardDetails.clientPanel.email}</dt>
          <dd className="break-words">{client.email ?? common.emptyValue}</dd>
          <dt className="text-muted">{cardDetails.clientPanel.niche}</dt>
          <dd className="break-words">{client.niche ?? common.emptyValue}</dd>
          <dt className="text-muted">{cardDetails.clientPanel.website}</dt>
          <dd className="min-w-0">
            <ClientWebsiteLink clientName={client.name} website={client.website} />
          </dd>
          <dt className="text-muted">{cardDetails.clientPanel.payInRate}</dt>
          <dd>{formatRate(client.pay_in_rate)}</dd>
          <dt className="text-muted">{cardDetails.clientPanel.payOutRate}</dt>
          <dd>{formatRate(client.pay_out_rate)}</dd>
        </dl>
      ) : (
        <p className="text-sm text-subtle">{cardDetails.clientPanel.noClientLinked}</p>
      )}
    </Card>
  )
}
