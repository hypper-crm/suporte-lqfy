import { stepSettings } from '../../i18n/pt-BR'
import { Skeleton } from '../ui/Skeleton'

const placeholderRowCount = 7

export function StepTemplateListSkeleton() {
  return (
    <div role="status" aria-label={stepSettings.loading} className="flex flex-col gap-1.5">
      {Array.from({ length: placeholderRowCount }, (_, index) => (
        <Skeleton key={index} className="h-11 rounded-card" />
      ))}
    </div>
  )
}
