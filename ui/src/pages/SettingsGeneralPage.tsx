import type React from 'react'
import { useMemo } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { Badge } from '../components/ui/Badge'
import { useMe } from '../hooks/useMe'
import { useModels } from '../hooks/useModels'

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="zanellm-settings-panel max-w-[840px] overflow-hidden rounded-xl">
      {children}
    </div>
  )
}

function SettingsRow({
  title,
  description,
  value,
}: {
  title: string
  description: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-border px-4 py-4 last:border-b-0">
      <div>
        <h2 className="text-base font-medium text-text-primary">{title}</h2>
        <p className="mt-1 text-base text-text-secondary">{description}</p>
      </div>
      <div className="shrink-0 text-base text-text-primary">{value}</div>
    </div>
  )
}

export default function SettingsGeneralPage() {
  const { data: me } = useMe()
  const { data: models } = useModels()

  const activeModels = useMemo(
    () => (models?.data ?? []).filter((model) => model.is_active).length,
    [models?.data],
  )

  return (
    <div className="mx-auto max-w-[840px] pt-20">
      <PageHeader title="General" />

      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-lg font-medium text-text-primary">Accounts</h2>
          <SettingsCard>
            <SettingsRow
              title="Base endpoint"
              description="OpenAI-compatible chat completions route"
              value={<span className="font-mono text-sm text-text-secondary">/v1/chat/completions</span>}
            />
            <SettingsRow
              title="Models"
              description="Active routes available through the local gateway"
              value={<Badge>{activeModels}</Badge>}
            />
            <SettingsRow
              title="Sign in"
              description="Local password-only session"
              value={<Badge variant="success">Enabled</Badge>}
            />
          </SettingsCard>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium text-text-primary">Account</h2>
          <SettingsCard>
            <SettingsRow
              title="Display name"
              description="Shown in the local dashboard"
              value={me?.display_name ?? '...'}
            />
            <SettingsRow
              title="Access"
              description="Permission scope for model and key management"
              value={me?.is_system_admin ? 'Owner' : 'User'}
            />
          </SettingsCard>
        </section>
      </div>
    </div>
  )
}
