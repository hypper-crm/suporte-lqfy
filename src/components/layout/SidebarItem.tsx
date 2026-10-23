import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'

type SidebarItemProps = {
  label: string
  icon: LucideIcon
  isActive: boolean
  // Shared by the sliding indicator, so it must be unique per menu on screen.
  indicatorLayoutId?: string
  onSelect: () => void
}

export function SidebarItem({ label, icon: Icon, isActive, indicatorLayoutId = 'sidebar-active-indicator', onSelect }: SidebarItemProps) {
  return (
    <button
      type="button"
      aria-current={isActive ? 'page' : undefined}
      onClick={onSelect}
      className={`relative flex h-11 items-center md:h-10 gap-3 rounded-card px-3 text-sm font-medium outline-none transition-colors duration-200 ease-fluid focus-visible:ring-2 focus-visible:ring-accent/40 ${
        isActive ? 'text-accent' : 'text-foreground/85 hover:bg-hover hover:text-foreground'
      }`}
    >
      {isActive && (
        <motion.span
          layoutId={indicatorLayoutId}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 rounded-card border border-accent/70 bg-accent/[0.07]"
        />
      )}
      <Icon aria-hidden="true" className="relative size-4 shrink-0" />
      <span className="relative">{label}</span>
    </button>
  )
}
