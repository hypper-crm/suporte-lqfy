import { LifeBuoy, ListChecks, Rocket, Users, type LucideIcon } from 'lucide-react'
import { screens } from '../../i18n/pt-BR'
import { screenLabels } from '../../lib/screens'
import type { AppScreen } from '../../types/board'
import { ProductMark } from './ProductMark'
import { SidebarItem } from './SidebarItem'

type SidebarSection = {
  label: string
  items: { screen: AppScreen; icon: LucideIcon }[]
}

export const sidebarSections: SidebarSection[] = [
  {
    label: screens.boardsSection,
    items: [
      { screen: 'support', icon: LifeBuoy },
      { screen: 'implementation', icon: Rocket },
    ],
  },
  {
    label: screens.directorySection,
    items: [{ screen: 'clients', icon: Users }],
  },
  {
    label: screens.settingsSection,
    items: [{ screen: 'stepSettings', icon: ListChecks }],
  },
]

type SidebarProps = {
  activeScreen: AppScreen
  onScreenChange: (screen: AppScreen) => void
}

export function Sidebar({ activeScreen, onScreenChange }: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center border-b border-border px-5">
        <ProductMark />
      </div>
      <nav aria-label={screens.navigationLabel} className="flex flex-col gap-6 px-3 py-5">
        {sidebarSections.map((section) => (
          <div key={section.label} className="flex flex-col gap-1">
            <h2 className="section-label px-2 pb-1">{section.label}</h2>
            {section.items.map((item) => (
              <SidebarItem
                key={item.screen}
                label={screenLabels[item.screen]}
                icon={item.icon}
                isActive={activeScreen === item.screen}
                onSelect={() => onScreenChange(item.screen)}
              />
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
