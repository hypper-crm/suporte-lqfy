import { motion } from 'motion/react'
import { auth } from '../../i18n/pt-BR'
import { ProductMark } from '../layout/ProductMark'
import { Card } from '../ui/Card'
import { overlayTransition } from '../ui/motionPresets'
import { AuthForm } from './AuthForm'

export function LoginScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={overlayTransition}
        className="w-full max-w-sm"
      >
        <Card isElevated className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-4">
            <ProductMark />
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold">{auth.welcomeTitle}</h1>
              <p className="text-sm text-muted">{auth.welcomeDescription}</p>
            </div>
          </div>
          <AuthForm />
        </Card>
      </motion.div>
    </main>
  )
}
