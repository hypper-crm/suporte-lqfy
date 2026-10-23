import { clients as clientStrings, common } from '../../i18n/pt-BR'
import type { ClientEmail } from '../../types/database'

type ClientEmailSummaryProps = {
  // Sorted by position.
  emails: ClientEmail[]
  className?: string
}

// The first email, followed by "+N" when the client has more.
export function ClientEmailSummary({ emails, className = '' }: ClientEmailSummaryProps) {
  const [firstEmail, ...otherEmails] = emails
  if (!firstEmail) return <span className={`text-subtle ${className}`}>{common.emptyValue}</span>

  return (
    <span className={`flex min-w-0 items-center gap-1.5 text-muted ${className}`}>
      <span className="truncate">{firstEmail.email}</span>
      {otherEmails.length > 0 && (
        <span
          title={otherEmails.map((email) => email.email).join(', ')}
          aria-label={clientStrings.moreEmailsLabel(otherEmails.length)}
          className="shrink-0 rounded-full border border-border px-1.5 text-xs text-subtle"
        >
          {clientStrings.moreEmails(otherEmails.length)}
        </span>
      )}
    </span>
  )
}
