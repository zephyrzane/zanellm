import { PageHeader } from '../components/ui/PageHeader'
import { useMe } from '../hooks/useMe'
import ModelsPage from './ModelsPage'

interface ModelsLayoutProps {
  embedded?: boolean
}

export default function ModelsLayout({ embedded = false }: ModelsLayoutProps) {
  const { data: me } = useMe()

  if (me && !me.is_system_admin) {
    return (
      <>
        {!embedded && <PageHeader title="Models" description="System model registry" />}
        <div className="zanellm-panel p-12 text-center">
          <p className="text-sm text-text-tertiary">You need system admin permissions to manage models.</p>
        </div>
      </>
    )
  }

  return <ModelsPage embedded={embedded} />
}
