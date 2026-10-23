import { getInitials } from '../../lib/formatting'

type AvatarSize = 'small' | 'medium'

const sizeClassNames: Record<AvatarSize, string> = {
  small: 'h-6 min-w-6 text-[10px]',
  medium: 'h-8 min-w-8 text-xs',
}

type AvatarProps = {
  fullName: string | null | undefined
  size?: AvatarSize
  title?: string
}

export function Avatar({ fullName, size = 'medium', title }: AvatarProps) {
  return (
    <span
      title={title}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent px-1 font-semibold text-on-accent ${sizeClassNames[size]}`}
    >
      {getInitials(fullName)}
    </span>
  )
}
