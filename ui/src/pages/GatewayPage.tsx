import { PageHeader } from '../components/ui/PageHeader'
import KeysPage from './KeysPage'
import ProviderAccountsPage from './ProviderAccountsPage'

export default function GatewayPage() {
  return (
    <div className="mx-auto min-h-full max-w-[1280px] pb-16 pt-12">
      <PageHeader title="Accounts & API" description="Upstream accounts, provider routes, and the one local key clients use." />

      <section className="zanellm-settings-panel overflow-hidden rounded-xl">
        <ProviderAccountsPage />
      </section>

      <section className="mt-4 zanellm-settings-panel overflow-hidden rounded-xl">
        <KeysPage embedded />
      </section>
    </div>
  )
}
