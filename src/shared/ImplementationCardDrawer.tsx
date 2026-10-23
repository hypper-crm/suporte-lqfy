import { ChecklistSection, type ChecklistStatus } from '../components/checklist/ChecklistSection'
import { ColumnStatusBadge } from '../components/board/ColumnStatusBadge'
import { OverdueBadge } from '../components/board/OverdueBadge'
import { Avatar } from '../components/ui/Avatar'
import { Drawer } from '../components/ui/Drawer'
import type { CardChecklistActions } from '../hooks/useCardTasks'
import { useCardDrawer, type CardDrawerProps } from '../hooks/useCardDrawer'
import type { ColumnStatus } from '../types/board'
import type { Card, CardTask, Profile } from '../types/database'
import { AttachmentsSection } from './cardDetails/AttachmentsSection'
import { CardCoverSection } from './cardDetails/CardCoverSection'
import { CardDetailsForm, CardSaveButton } from './cardDetails/CardDetailsForm'
import { CardAssigneesField, CardClientField, CardStartDateField } from './cardDetails/CardFormFields'
import { CardTitleDescriptionSection } from './cardDetails/CardTitleDescriptionSection'
import { ClientInfoPanel } from './cardDetails/ClientInfoPanel'
import { DeleteCardSection } from './cardDetails/DeleteCardSection'
import { MissingCardDrawer } from './cardDetails/MissingCardDrawer'

type ImplementationCardContentProps = CardDrawerProps & {
  profiles: Profile[]
  profilesById: Record<string, Profile>
  currentUserId: string
  // Sorted by position.
  tasks: CardTask[]
  checklistStatus: ChecklistStatus
  checklistActions: CardChecklistActions
  // The column the card is in, shown as a status badge.
  columnStatus: ColumnStatus | undefined
}

function ImplementationCardContent({
  profiles,
  profilesById,
  currentUserId,
  tasks,
  checklistStatus,
  checklistActions,
  columnStatus,
  ...drawerProps
}: ImplementationCardContentProps) {
  const { card, clients, overdueDayCount } = drawerProps
  const { form, linkedClient, requestClose, updateCover, deleteCard } = useCardDrawer(drawerProps)

  const hasBadges = columnStatus !== undefined || overdueDayCount !== undefined

  return (
    // The header leads with the client, like the card on the board.
    <Drawer
      title={linkedClient?.name ?? card.title}
      titleLeading={linkedClient && <Avatar fullName={linkedClient.name} imageUrl={linkedClient.cover_image_url} />}
      onClose={requestClose}
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
        <CardAssigneesField form={form} profiles={profiles} />
        <CardStartDateField form={form} />
        <CardClientField form={form} clients={clients} />
        <CardTitleDescriptionSection form={form} isTitleRequired={!form.values.clientId} />
      </CardDetailsForm>
      <ChecklistSection
        cardId={card.id}
        tasks={tasks}
        profilesById={profilesById}
        status={checklistStatus}
        actions={checklistActions}
      />
      <CardCoverSection card={card} onUpdateCover={updateCover} />
      <AttachmentsSection
        cardId={card.id}
        currentUserId={currentUserId}
        coverAttachmentId={card.cover_attachment_id}
        onUpdateCover={updateCover}
      />
      <DeleteCardSection cardTitle={card.title} onConfirm={deleteCard} />
    </Drawer>
  )
}

type ImplementationCardDrawerProps = Omit<ImplementationCardContentProps, 'card'> & {
  // Undefined when the card was deleted or moved to another board while the drawer was open.
  card: Card | undefined
}

export function ImplementationCardDrawer({ card, ...contentProps }: ImplementationCardDrawerProps) {
  if (!card) return <MissingCardDrawer onClose={contentProps.onClose} />
  // The key resets the form when a different card is opened.
  return <ImplementationCardContent key={card.id} card={card} {...contentProps} />
}
