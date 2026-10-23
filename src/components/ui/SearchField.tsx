import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function SearchField({ className = '', ...inputProps }: SearchFieldProps) {
  return (
    <div
      className={`flex h-11 items-center gap-2.5 rounded-card border border-border bg-surface px-3.5 transition-[border-color,box-shadow] duration-200 ease-fluid hover:border-border-strong focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/15 ${className}`}
    >
      <Search aria-hidden="true" className="size-4 shrink-0 text-muted" />
      <input
        type="search"
        className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-subtle"
        {...inputProps}
      />
    </div>
  )
}
