import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-4 pt-5 pb-5 md:px-8 md:pt-7 md:pb-6">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </div>
      {actions}
    </div>
  )
}
