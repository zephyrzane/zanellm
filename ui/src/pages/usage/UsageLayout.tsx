import { Link, useLocation, Outlet } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'

const tabs = [
  { path: '/usage', label: 'Overview', exact: true },
  { path: '/usage/llm', label: 'LLM' },
]

export default function UsageLayout() {
  const location = useLocation()

  return (
    <div className="mx-auto max-w-[920px] pt-20">
      <PageHeader
        title="Usage"
        description="Track model requests, tokens, and costs"
      />

      <div className="mb-6 inline-flex items-center gap-1 rounded-xl bg-[#242424] p-1">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? location.pathname === tab.path
            : location.pathname.startsWith(tab.path)
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`rounded px-3 py-1.5 text-sm font-medium no-underline transition-colors ${
                isActive
                  ? 'bg-[#303030] text-text-primary'
                  : 'text-text-secondary hover:bg-white/[0.045] hover:text-text-primary'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      <Outlet />
    </div>
  )
}
