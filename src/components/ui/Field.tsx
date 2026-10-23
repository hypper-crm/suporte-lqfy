import type { ReactNode } from 'react'

type FieldProps = {
  id: string
  label: string
  errorMessage?: string
  children: ReactNode
}

export function fieldErrorId(id: string): string {
  return `${id}-error`
}

export function Field({ id, label, errorMessage, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted">
        {label}
      </label>
      {children}
      {errorMessage && (
        <p id={fieldErrorId(id)} className="text-xs text-danger">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
