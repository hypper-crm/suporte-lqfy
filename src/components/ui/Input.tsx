import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const baseFieldClassName =
  'w-full rounded-card border bg-background/60 px-3 text-base text-foreground md:text-sm outline-none placeholder:text-subtle transition-[border-color,box-shadow,background-color] duration-200 ease-fluid hover:border-border-strong focus:ring-2 disabled:opacity-50'

function fieldClassName(hasError: boolean, className: string): string {
  const stateClassName = hasError
    ? 'border-danger/70 focus:border-danger focus:ring-danger/15'
    : 'border-border focus:border-accent/60 focus:ring-accent/15'
  return `${baseFieldClassName} ${stateClassName} ${className}`
}

type FieldStateProps = {
  hasError?: boolean
}

type InputHeight = 'medium' | 'compact'

// Below the md breakpoint inputs are 44px tall.
const inputHeightClassNames: Record<InputHeight, string> = {
  medium: 'h-11 md:h-10',
  compact: 'h-11 md:h-8',
}

type InputProps = InputHTMLAttributes<HTMLInputElement> &
  FieldStateProps & {
    fieldHeight?: InputHeight
  }

export function Input({ hasError = false, fieldHeight = 'medium', className = '', ...inputProps }: InputProps) {
  return <input className={fieldClassName(hasError, `${inputHeightClassNames[fieldHeight]} ${className}`)} {...inputProps} />
}

export function Textarea({
  hasError = false,
  className = '',
  ...textareaProps
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldStateProps) {
  return <textarea className={fieldClassName(hasError, `resize-y py-2.5 leading-relaxed ${className}`)} {...textareaProps} />
}

export function Select({ hasError = false, className = '', ...selectProps }: SelectHTMLAttributes<HTMLSelectElement> & FieldStateProps) {
  return <select className={fieldClassName(hasError, `select-chevron h-11 md:h-10 ${className}`)} {...selectProps} />
}
