import { profileScreen } from '../../i18n/pt-BR'
import type { Profile } from '../../types/database'
import { PageHeader } from '../layout/PageHeader'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { AvatarUploadField } from './AvatarUploadField'

type ProfileScreenProps = {
  // Null while the profile is loading or when it could not be loaded.
  profile: Profile | null
  email: string | null
  onUploadAvatar: (file: File, mimeType: string, extension: string) => Promise<void>
}

export function ProfileScreen({ profile, email, onUploadAvatar }: ProfileScreenProps) {
  return (
    <div className="flex flex-1 flex-col md:min-h-0 md:overflow-y-auto">
      <PageHeader title={profileScreen.title} description={profileScreen.description} />
      <div className="px-4 pb-8 md:px-8">
        {profile ? (
          <Card className="flex max-w-xl flex-col gap-6 p-5 md:p-6">
            <AvatarUploadField
              displayName={profile.full_name || email || profileScreen.noName}
              avatarUrl={profile.avatar_url}
              onUpload={onUploadAvatar}
            />
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-border pt-5 text-sm">
              <dt className="text-muted">{profileScreen.name}</dt>
              <dd className={`break-words ${profile.full_name ? 'font-medium' : 'text-subtle'}`}>
                {profile.full_name || profileScreen.noName}
              </dd>
            </dl>
          </Card>
        ) : (
          <Card role="status" aria-label={profileScreen.loading} className="flex max-w-xl items-center gap-4 p-5 md:p-6">
            <Skeleton className="size-20 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
