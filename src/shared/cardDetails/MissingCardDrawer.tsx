import { cardDetails } from '../../i18n/pt-BR'
import { Drawer } from '../../components/ui/Drawer'
import { StatusMessage } from '../../components/ui/StatusMessage'

type MissingCardDrawerProps = {
  onClose: () => void
}

// Shown when the open card was deleted or moved to another board while the drawer was open.
export function MissingCardDrawer({ onClose }: MissingCardDrawerProps) {
  return (
    <Drawer title={cardDetails.title} onClose={onClose}>
      <StatusMessage variant="info">{cardDetails.missingCard}</StatusMessage>
    </Drawer>
  )
}
