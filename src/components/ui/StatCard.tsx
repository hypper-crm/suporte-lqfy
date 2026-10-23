import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'

type StatCardProps = {
  label: string
  value: number
  caption: string
  icon: LucideIcon
}

export function StatCard({ label, value, caption, icon: Icon }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="section-label">{label}</h3>
        <span className="flex size-8 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-accent">
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </div>
      <p className="text-[30px] leading-none font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted">{caption}</p>
    </Card>
  )
}
