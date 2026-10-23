import { ChecklistSection, type ChecklistStatus } from '../components/checklist/ChecklistSection'
import { Drawer } from '../components/ui/Drawer'
import type { CardChecklistActions } from '../hooks/useCardTasks'
import { useCardDrawer, type CardDrawerProps } from '../hooks/useCardDrawer'
import { cardDetails } from '../i18n/pt-BR'
import type { Card, CardTask, Profile } from '../types/database'
import { AttachmentsSection } from './cardDetails/AttachmentsSection'
import { CardDetailsForm, CardSaveButton } from './cardDetails/CardDetailsForm'
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

type ImplementationCardContentProps = CardDrawerProps & {
  profiles: Profile[]
  profilesById: Record<string, Profile>
  currentUserId: string
  // Sorted by position.
  tasks: CardTask[]
  checklistStatus: ChecklistStatus
  checklistActions: CardChecklistActions
}

function ImplementationCardContent({
  profiles,
  profilesById,
  currentUserId,
  tasks,
  checklistStatus,
  checklistActions,
  ...drawerProps
}: ImplementationCardContentProps) {
  const { card, clients } = drawerProps
  const { form, linkedClient, requestClose, deleteCard } = useCardDrawer(drawerProps)

  return (
    <Drawer
      title={cardDetails.title}
      description={card.title}
      onClose={requestClose}
      headerAction={<CardSaveButton form={form} />}
    >
      <ClientInfoPanel client={linkedClient} />
      <CardDetailsForm form={form}>
        <CardTitleField form={form} />
        <CardDescriptionField form={form} />
        <CardStartDateField form={form} />
        <CardClientField form={form} clients={clients} />
        <CardAssigneesField form={form} profiles={profiles} />
      </CardDetailsForm>
      <ChecklistSection
        cardId={card.id}
        tasks={tasks}
        profilesById={profilesById}
        status={checklistStatus}
        actions={checklistActions}
      />
      <AttachmentsSection cardId={card.id} currentUserId={currentUserId} />
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
