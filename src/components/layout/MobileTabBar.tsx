import { screens } from '../../i18n/pt-BR'
import { screenLabels } from '../../lib/screens'
import type { AppScreen } from '../../types/board'
import { Tabs } from '../ui/Tabs'
import { sidebarSections } from './Sidebar'

const screenOptions = sidebarSections.flatMap((section) =>
  section.items.map((item) => ({ value: item.screen, label: screenLabels[item.screen] })),
)

type MobileTabBarProps = {
  activeScreen: AppScreen
  onScreenChange: (screen: AppScreen) => void
}

// Replaces the sidebar on narrow screens.
export function MobileTabBar({ activeScreen, onScreenChange }: MobileTabBarProps) {
  return (
    <nav aria-label={screens.navigationLabel} className="overflow-x-auto border-b border-border px-4 py-2 md:hidden">
      <Tabs
        options={screenOptions}
        value={activeScreen}
        layoutId="mobile-screen-tab-indicator"
        ariaLabel={screens.navigationLabel}
        isFullWidth
        onChange={onScreenChange}
      />
    </nav>
  )
}
