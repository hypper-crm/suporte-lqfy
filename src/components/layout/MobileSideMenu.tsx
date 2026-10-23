import { CalendarClock, LifeBuoy, ListChecks, LogOut, Rocket, UserRound, Users, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { header, screens } from '../../i18n/pt-BR'
import { screenLabels } from '../../lib/screens'
import type { AppScreen } from '../../types/board'
import { overlayTransition } from '../ui/motionPresets'
import { ProductMark } from './ProductMark'
import { SidebarItem } from './SidebarItem'

const menuItems: { screen: AppScreen; icon: LucideIcon }[] = [
  { screen: 'support', icon: LifeBuoy },
  { screen: 'implementation', icon: Rocket },
  { screen: 'clients', icon: Users },
  { screen: 'stepSettings', icon: ListChecks },
  { screen: 'deadlineSettings', icon: CalendarClock },
  { screen: 'profile', icon: UserRound },
]

export const mobileSideMenuId = 'mobile-side-menu'

type MobileSideMenuProps = {
  activeScreen: AppScreen
  isSigningOut: boolean
  onScreenChange: (screen: AppScreen) => void
  onSignOut: () => void
  onClose: () => void
}

// Replaces the sidebar below the md breakpoint. Render inside AnimatePresence so the menu can animate out.
export function MobileSideMenu({ activeScreen, isSigningOut, onScreenChange, onSignOut, onClose }: MobileSideMenuProps) {
  const panelRef = useRef<HTMLElement>(null)
  useFocusTrap(panelRef)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !event.defaultPrevented) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function selectScreen(screen: AppScreen) {
    onScreenChange(screen)
    onClose()
  }

  function signOut() {
    onSignOut()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-drawer md:hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={overlayTransition}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.aside
        ref={panelRef}
        id={mobileSideMenuId}
        role="dialog"
        aria-modal="true"
        aria-label={header.sideMenuLabel}
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={overlayTransition}
        className="relative flex h-full w-[85vw] max-w-[300px] flex-col overflow-y-auto overscroll-contain border-r border-border bg-surface pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] shadow-[24px_0_48px_-24px_rgba(0,0,0,0.8)]"
      >
        <div className="flex h-14 shrink-0 items-center border-b border-border px-5">
          <ProductMark isCompact />
        </div>
        <nav aria-label={screens.navigationLabel} className="flex flex-col gap-1 px-3 py-4">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.screen}
              label={screenLabels[item.screen]}
              icon={item.icon}
              isActive={activeScreen === item.screen}
              indicatorLayoutId="side-menu-active-indicator"
              onSelect={() => selectScreen(item.screen)}
            />
          ))}
          <div className="my-2 h-px bg-border" />
          <SidebarItem label={isSigningOut ? header.signingOut : header.signOut} icon={LogOut} isActive={false} onSelect={signOut} />
        </nav>
      </motion.aside>
    </div>
  )
}
