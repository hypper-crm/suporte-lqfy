import type { ReactNode } from 'react'

type FullPageMessageProps = {
  title?: string
  children: ReactNode
}

export function FullPageMessage({ title, children }: FullPageMessageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        {title && <h1 className="text-xl font-semibold">{title}</h1>}
        {children}
      </div>
    </main>
  )
}
