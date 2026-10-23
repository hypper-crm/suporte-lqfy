import { KanbanSquare, ListChecks, Users, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { screens } from '../../i18n/pt-BR'
import type { AppScreen } from '../../types/board'
import type { Board } from '../../types/database'

type MobileTab = {
  label: string
  icon: LucideIcon
  // The screen opened by the tab.
  screen: AppScreen
  isActive: boolean
}

type MobileTabBarProps = {
  activeScreen: AppScreen
  // The board opened by the boards tab. The board page switches between boards.
  lastBoard: Board
  onScreenChange: (screen: AppScreen) => void
}

// Replaces the sidebar below the md breakpoint.
export function MobileTabBar({ activeScreen, lastBoard, onScreenChange }: MobileTabBarProps) {
  const tabs: MobileTab[] = [
    {
      label: screens.boardsTab,
      icon: KanbanSquare,
      screen: lastBoard,
      isActive: activeScreen === 'support' || activeScreen === 'implementation',
    },
    { label: screens.clientsTab, icon: Users, screen: 'clients', isActive: activeScreen === 'clients' },
    { label: screens.stepSettingsTab, icon: ListChecks, screen: 'stepSettings', isActive: activeScreen === 'stepSettings' },
  ]

  return (
    <nav
      aria-label={screens.navigationLabel}
      className="fixed inset-x-0 bottom-0 z-bar border-t border-border bg-surface/95 pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] backdrop-blur md:hidden"
    >
      <ul className="grid h-(--mobile-tab-bar-height) grid-cols-3">
        {tabs.map((tab) => (
          <li key={tab.label} className="flex">
            <button
              type="button"
              aria-current={tab.isActive ? 'page' : undefined}
              onClick={() => onScreenChange(tab.screen)}
              className={`relative flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium outline-none transition-colors duration-200 ease-fluid focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-inset ${
                tab.isActive ? 'text-accent' : 'text-muted'
              }`}
            >
              {tab.isActive && (
                <motion.span
                  layoutId="mobile-tab-indicator"
                  transition={{ duration: 0.25 }}
                  className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-accent"
                />
              )}
              <tab.icon aria-hidden="true" className="size-5 shrink-0" />
              <span className="max-w-full truncate px-1">{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
