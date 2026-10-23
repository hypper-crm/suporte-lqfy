import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { StatusMessage } from '../../components/ui/StatusMessage'
import { Switch } from '../../components/ui/Switch'
import { cardDetails, serviceErrors } from '../../i18n/pt-BR'
import type { CardCoverInput } from '../../types/board'
import type { Card } from '../../types/database'

type CardCoverSectionProps = {
  card: Card
  onUpdateCover: (input: CardCoverInput) => Promise<void>
}

type PendingChange = 'removeCover' | 'showClientCover'

export function CardCoverSection({ card, onUpdateCover }: CardCoverSectionProps) {
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function applyChange(change: PendingChange, input: CardCoverInput) {
    setPendingChange(change)
    setErrorMessage(null)
    try {
      await onUpdateCover(input)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : serviceErrors.cardCoverSave)
    } finally {
      setPendingChange(null)
    }
  }

  const hasCover = card.cover_attachment_id !== null

  return (
    <section className="flex flex-col gap-2">
      <h3 className="section-label">{cardDetails.cover.title}</h3>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="text-sm text-muted">{hasCover ? cardDetails.cover.hasCover : cardDetails.cover.noCover}</p>
        {hasCover && (
          <Button
            variant="ghost"
            size="small"
            disabled={pendingChange !== null}
            onClick={() => void applyChange('removeCover', { coverAttachmentId: null })}
          >
            <ImageOff aria-hidden="true" className="size-3.5" />
            {pendingChange === 'removeCover' ? cardDetails.cover.removingCover : cardDetails.cover.removeCover}
          </Button>
        )}
      </div>
      <Switch
        label={cardDetails.cover.showClientCover}
        isChecked={card.show_client_cover}
        isDisabled={pendingChange !== null}
        onChange={(isChecked) => void applyChange('showClientCover', { showClientCover: isChecked })}
      />
      {errorMessage && <StatusMessage variant="error">{errorMessage}</StatusMessage>}
    </section>
  )
}
