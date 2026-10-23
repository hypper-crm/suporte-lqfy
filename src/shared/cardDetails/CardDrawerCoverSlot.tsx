import type { CardDrawerState } from '../../hooks/useCardDrawer'
import type { CardCoverImage } from '../../lib/cardCover'
import type { Card } from '../../types/database'
import { CardDrawerCover } from './CardDrawerCover'

type CardDrawerCoverSlotProps = {
  card: Card
  cover: CardCoverImage | undefined
  drawer: CardDrawerState
}

// Connects the drawer cover to the card's attachments.
export function CardDrawerCoverSlot({ card, cover, drawer }: CardDrawerCoverSlotProps) {
  return (
    <CardDrawerCover
      cover={cover}
      coverAttachmentId={card.cover_attachment_id}
      imageAttachments={drawer.imageAttachments}
      isLoadingAttachments={drawer.attachmentsState.isLoading}
      onUploadImage={drawer.attachmentsState.uploadCoverImage}
      onUpdateCover={drawer.updateCover}
    />
  )
}
