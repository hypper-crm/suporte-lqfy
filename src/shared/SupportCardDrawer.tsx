import { ColumnStatusBadge } from '../components/board/ColumnStatusBadge'
import { OverdueBadge } from '../components/board/OverdueBadge'
import { Drawer } from '../components/ui/Drawer'
import { useCardDrawer, type CardDrawerProps } from '../hooks/useCardDrawer'
import { cardDetails } from '../i18n/pt-BR'
import type { ColumnStatus } from '../types/board'
import type { Card, Profile } from '../types/database'
import { AttachmentsSection } from './cardDetails/AttachmentsSection'
import { CardDetailsForm, CardSaveButton } from './cardDetails/CardDetailsForm'
import { CardDrawerCoverSlot } from './cardDetails/CardDrawerCoverSlot'
import {
  CardAssigneesField,
  CardClientField,
  CardDescriptionField,
  CardStartDateField,
  CardTitleField,
} from './cardDetails/CardFormFields'
import { ClientInfoPanel } from './cardDetails/ClientInfoPanel'
import { DeleteCardSection } from './cardDetails/DeleteCardSection'
import { MissingCardDrawer } from './cardDetails/MissingCardDrawer'
import { CardPriorityField, CardRequestTypeField } from './cardDetails/SupportCardFields'

type SupportCardContentProps = CardDrawerProps & {
  profiles: Profile[]
  // The column the card is in, shown as a status badge.
  columnStatus: ColumnStatus | undefined
}

function SupportCardContent({ profiles, columnStatus, ...drawerProps }: SupportCardContentProps) {
  const { card, cover, overdueDayCount } = drawerProps
  const drawer = useCardDrawer(drawerProps)
  const { form, linkedClient, attachmentsState, requestClose, updateCover, deleteCard } = drawer

  const hasBadges = columnStatus !== undefined || overdueDayCount !== undefined

  return (
    <Drawer
      title={cardDetails.title}
      description={card.title}
      onClose={requestClose}
      cover={<CardDrawerCoverSlot card={card} cover={cover} drawer={drawer} />}
      headerAction={<CardSaveButton form={form} />}
      headerBadges={
        hasBadges && (
          <>
            {columnStatus && <ColumnStatusBadge status={columnStatus} />}
            <OverdueBadge dayCount={overdueDayCount} />
          </>
        )
      }
    >
      <ClientInfoPanel client={linkedClient} />
      <CardDetailsForm form={form}>
        <CardTitleField form={form} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CardPriorityField form={form} />
          <CardRequestTypeField form={form} />
        </div>
        <CardDescriptionField form={form} />
        <CardStartDateField form={form} />
        <CardClientField form={form} clients={drawerProps.clients} />
        <CardAssigneesField form={form} profiles={profiles} />
      </CardDetailsForm>
      <AttachmentsSection attachmentsState={attachmentsState} coverAttachmentId={card.cover_attachment_id} onUpdateCover={updateCover} />
      <DeleteCardSection cardTitle={card.title} onConfirm={deleteCard} />
    </Drawer>
  )
}

type SupportCardDrawerProps = Omit<SupportCardContentProps, 'card'> & {
  // Undefined when the card was deleted or moved to another board while the drawer was open.
  card: Card | undefined
}

export function SupportCardDrawer({ card, ...contentProps }: SupportCardDrawerProps) {
  if (!card) return <MissingCardDrawer onClose={contentProps.onClose} />
  // The key resets the form when a different card is opened.
  return <SupportCardContent key={card.id} card={card} {...contentProps} />
}
