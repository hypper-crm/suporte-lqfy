import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const baseFieldClassName =
  'w-full rounded-card border bg-background/60 px-3 text-sm text-foreground outline-none placeholder:text-subtle transition-[border-color,box-shadow,background-color] duration-200 ease-fluid hover:border-border-strong focus:ring-2 disabled:opacity-50'

function fieldClassName(hasError: boolean, className: string): string {
  const stateClassName = hasError
    ? 'border-danger/70 focus:border-danger focus:ring-danger/15'
    : 'border-border focus:border-accent/60 focus:ring-accent/15'
  return `${baseFieldClassName} ${stateClassName} ${className}`
}

type FieldStateProps = {
  hasError?: boolean
}

export function Input({ hasError = false, className = '', ...inputProps }: InputHTMLAttributes<HTMLInputElement> & FieldStateProps) {
  return <input className={fieldClassName(hasError, `h-10 ${className}`)} {...inputProps} />
}

export function Textarea({
  hasError = false,
  className = '',
  ...textareaProps
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldStateProps) {
  return <textarea className={fieldClassName(hasError, `resize-y py-2.5 leading-relaxed ${className}`)} {...textareaProps} />
}

export function Select({ hasError = false, className = '', ...selectProps }: SelectHTMLAttributes<HTMLSelectElement> & FieldStateProps) {
  return <select className={fieldClassName(hasError, `select-chevron h-10 ${className}`)} {...selectProps} />
}
