import { useSyncExternalStore } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Sidebar } from './Sidebar'
import { LOCAL_STORAGE_KEY } from '../../lib/constants'
import { useMe } from '../../hooks/useMe'
import { Avatar } from '../profile/Avatar'
import { getStoredAvatar, subscribeProfileChanges } from '../../lib/profile'

function TopActions() {
  const queryClient = useQueryClient()
  const { data: me } = useMe()
  const avatar = useSyncExternalStore(subscribeProfileChanges, getStoredAvatar, () => null)

  return (
    <div className="fixed right-3 top-3 z-50 flex items-center gap-2 md:right-6 md:top-5">
      <Link
        to="/profile"
        className="flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm text-text-secondary no-underline hover:bg-white/[0.055] hover:text-text-primary"
      >
        <Avatar name={me?.display_name} src={avatar} size="sm" />
        <span>Profile</span>
      </Link>
      <button
        type="button"
        onClick={() => {
          localStorage.removeItem(LOCAL_STORAGE_KEY)
          queryClient.clear()
          window.location.href = '/login'
        }}
        className="h-9 rounded-lg px-3 text-sm text-text-secondary hover:bg-white/[0.055] hover:text-error"
      >
        Logout
      </button>
    </div>
  )
}

export function Shell() {
  return (
    <div className="min-h-screen min-w-[1180px] overflow-hidden bg-bg-primary p-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-accent focus:text-bg-primary focus:rounded-md focus:m-2"
      >
        Skip to content
      </a>
      <Sidebar />
      <TopActions />
      <main
        id="main-content"
        className="zanellm-surface ml-[300px] mt-2 h-[calc(100vh-8px)] max-w-[calc(100%-300px)] min-w-0 overflow-auto px-6 pb-5 pt-5"
      >
        <div className="zanellm-app-scale">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
