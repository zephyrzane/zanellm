import { useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import TabSwitcher from '../components/ui/TabSwitcher'
import KeysPage from './KeysPage'
import ModelsLayout from './ModelsLayout'
import ProviderAccountsPage from './ProviderAccountsPage'

type GatewayTab = 'accounts' | 'models'

const tabs = [
  { key: 'accounts', label: 'Accounts' },
  { key: 'models', label: 'API' },
]

export default function GatewayPage() {
  const [activeTab, setActiveTab] = useState<GatewayTab>('accounts')

  return (
    <div className="mx-auto min-h-full max-w-[1280px] pb-16 pt-12">
      <PageHeader title="API & Accounts" description="Upstream accounts, provider APIs, routing, and the one local key clients use." />

      <section className="zanellm-settings-panel overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
          <TabSwitcher
            tabs={tabs}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as GatewayTab)}
            className="mb-0"
          />
          <span className="hidden font-mono text-xs text-text-tertiary sm:block">/v1</span>
        </div>

        <div>
          {activeTab === 'accounts' && <ProviderAccountsPage />}
          {activeTab === 'models' && <ModelsLayout embedded />}
        </div>
      </section>

      <section className="mt-4 zanellm-settings-panel overflow-hidden rounded-xl">
        <KeysPage embedded />
      </section>
    </div>
  )
}
