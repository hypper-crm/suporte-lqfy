import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { header } from '../../i18n/pt-BR'

export function ConnectionStatusPill() {
  const isOnline = useOnlineStatus()

  return (
    <span
      role="status"
      className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors duration-200 ease-fluid ${
        isOnline ? 'border-accent/30 bg-accent/10 text-accent' : 'border-danger/30 bg-danger/10 text-danger'
      }`}
    >
      <span className={`size-1.5 rounded-full ${isOnline ? 'bg-accent' : 'bg-danger'}`} />
      {isOnline ? header.online : header.offline}
    </span>
  )
}
