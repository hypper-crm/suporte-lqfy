import type { Card, Client } from '../../types/database'
import { Avatar } from '../ui/Avatar'

type CardClientHeaderProps = {
  card: Card
  client: Client | undefined
}

// The most prominent line of every card: the client, or the card title when there is no client.
export function CardClientHeader({ card, client }: CardClientHeaderProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {client && <Avatar fullName={client.name} imageUrl={client.cover_image_url} />}
      <p className="min-w-0 truncate text-[15px] leading-snug font-bold">{client?.name ?? card.title}</p>
    </div>
  )
}
