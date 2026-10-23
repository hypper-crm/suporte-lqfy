import { Plus, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { clients as clientStrings } from '../../i18n/pt-BR'
import { createEmailFormRow, type ClientEmailFormRow } from '../../lib/clientFormValidation'
import { Button } from '../ui/Button'
import { fieldErrorId } from '../ui/Field'
import { Input } from '../ui/Input'

const labelId = 'client-emails-label'

type ClientEmailsFieldProps = {
  rows: ClientEmailFormRow[]
  // Keyed by the row key.
  errorMessages: Record<string, string> | undefined
  disabled: boolean
  onChange: (rows: ClientEmailFormRow[]) => void
}

export function ClientEmailsField({ rows, errorMessages, disabled, onChange }: ClientEmailsFieldProps) {
  function updateRow(key: string, email: string) {
    onChange(rows.map((row) => (row.key === key ? { ...row, email } : row)))
  }

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-1.5">
      <span id={labelId} className="text-xs font-medium text-muted">
        {clientStrings.form.emails}
      </span>
      {rows.length === 0 && <p className="text-sm text-subtle">{clientStrings.form.noEmails}</p>}
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {rows.map((row, index) => {
            const inputId = `client-email-${row.key}`
            const errorMessage = errorMessages?.[row.key]
            return (
              <motion.li key={row.key} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Input
                    id={inputId}
                    type="email"
                    inputMode="email"
                    autoComplete="off"
                    aria-label={clientStrings.form.emailLabel(index + 1)}
                    placeholder={clientStrings.form.emailPlaceholder}
                    value={row.email}
                    disabled={disabled}
                    hasError={Boolean(errorMessage)}
                    aria-invalid={Boolean(errorMessage)}
                    aria-describedby={errorMessage ? fieldErrorId(inputId) : undefined}
                    onChange={(event) => updateRow(row.key, event.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={clientStrings.form.removeEmail(row.email.trim())}
                    title={clientStrings.form.removeEmail(row.email.trim())}
                    disabled={disabled}
                    onClick={() => onChange(rows.filter((current) => current.key !== row.key))}
                  >
                    <X aria-hidden="true" className="size-4" />
                  </Button>
                </div>
                {errorMessage && (
                  <p id={fieldErrorId(inputId)} className="text-xs text-danger">
                    {errorMessage}
                  </p>
                )}
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
      <Button variant="ghost" size="small" disabled={disabled} onClick={() => onChange([...rows, createEmailFormRow()])} className="self-start">
        <Plus aria-hidden="true" className="size-4" />
        {clientStrings.form.addEmail}
      </Button>
    </div>
  )
}
