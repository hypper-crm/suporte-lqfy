import { auth } from '../../i18n/pt-BR'
import type { AuthMode } from '../../types/auth'
import { Tabs, type TabOption } from '../ui/Tabs'

const authModeOptions: TabOption<AuthMode>[] = [
  { value: 'sign-in', label: auth.signIn },
  { value: 'create-account', label: auth.createAccount },
]

type AuthModeTabsProps = {
  mode: AuthMode
  isDisabled: boolean
  onChange: (mode: AuthMode) => void
}

export function AuthModeTabs({ mode, isDisabled, onChange }: AuthModeTabsProps) {
  return (
    <Tabs
      options={authModeOptions}
      value={mode}
      layoutId="auth-mode-indicator"
      ariaLabel={auth.modeTabsLabel}
      isDisabled={isDisabled}
      isFullWidth
      onChange={onChange}
    />
  )
}
