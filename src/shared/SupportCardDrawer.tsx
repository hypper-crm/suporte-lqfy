import { Drawer } from '../components/ui/Drawer'
import { useCardDrawer, type CardDrawerProps } from '../hooks/useCardDrawer'
import { cardDetails } from '../i18n/pt-BR'
import type { Card, Profile } from '../types/database'
import { AttachmentsSection } from './cardDetails/AttachmentsSection'
import { CardDetailsForm, CardSaveButton } from './cardDetails/CardDetailsForm'
import {
  CardAssigneeField,
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
  currentUserId: string
}

function SupportCardContent({ profiles, currentUserId, ...drawerProps }: SupportCardContentProps) {
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CardPriorityField form={form} />
          <CardRequestTypeField form={form} />
        </div>
        <CardDescriptionField form={form} />
        <CardStartDateField form={form} />
        <CardClientField form={form} clients={clients} />
        <CardAssigneeField form={form} profiles={profiles} />
      </CardDetailsForm>
      <AttachmentsSection cardId={card.id} currentUserId={currentUserId} />
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
