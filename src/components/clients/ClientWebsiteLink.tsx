import { ExternalLink } from 'lucide-react'
import { clients as clientStrings, common } from '../../i18n/pt-BR'
import { formatWebsite } from '../../lib/website'

type ClientWebsiteLinkProps = {
  clientName: string
  website: string | null
}

export function ClientWebsiteLink({ clientName, website }: ClientWebsiteLinkProps) {
  if (!website) return <span className="text-subtle">{common.emptyValue}</span>

  return (
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={clientStrings.openWebsite(clientName)}
      title={website}
      className="inline-flex max-w-full items-center gap-1 rounded text-accent outline-none transition-colors duration-200 ease-fluid hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <span className="truncate">{formatWebsite(website)}</span>
      <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
    </a>
  )
}
