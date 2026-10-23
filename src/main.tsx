import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { FullPageMessage } from './components/common/FullPageMessage'
import { MotionProvider } from './components/ui/MotionProvider'
import { StatusMessage } from './components/ui/StatusMessage'
import { appStart } from './i18n/pt-BR'

const root = createRoot(document.getElementById('root')!)

// The app is loaded dynamically so a missing Supabase configuration shows a clear message instead of a blank page.
import('./App')
  .then(({ App }) => {
    root.render(
      <StrictMode>
        <MotionProvider>
          <App />
        </MotionProvider>
      </StrictMode>,
    )
  })
  .catch((error: unknown) => {
    root.render(
      <FullPageMessage title={appStart.failedTitle}>
        <StatusMessage variant="error">
          {error instanceof Error ? error.message : appStart.failedMessage}
        </StatusMessage>
      </FullPageMessage>,
    )
  })
