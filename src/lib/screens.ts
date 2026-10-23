import { screens } from '../i18n/pt-BR'
import type { AppScreen } from '../types/board'

export const screenLabels: Record<AppScreen, string> = {
  support: screens.support,
  implementation: screens.implementation,
  clients: screens.clients,
  stepSettings: screens.stepSettings,
  deadlineSettings: screens.deadlineSettings,
  profile: screens.profile,
}
