import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from './pages/auth/LoginPage'
import CallbackPage from './pages/auth/CallbackPage'
import AcceptInvitePage from './pages/AcceptInvitePage'
import GatewayPage from './pages/GatewayPage'
import UsageOverviewPage from './pages/usage/UsageOverviewPage'
import PlaygroundPage from './pages/PlaygroundPage'
import GuidePage from './pages/GuidePage'
import ProfilePage from './pages/ProfilePage'
import SettingsGeneralPage from './pages/SettingsGeneralPage'
import { ToastProvider } from './hooks/useToast'
import { Shell } from './components/layout/Shell'
import { PageHeader } from './components/ui/PageHeader'
import { LOCAL_STORAGE_KEY } from './lib/constants'
import { applyStoredTheme } from './lib/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="zanellm-panel p-12 text-center">
        <p className="text-sm text-text-tertiary">Page not found</p>
      </div>
    </>
  )
}

function RequireAuth() {
  const token = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (!token) return <Navigate to="/login" replace />
  return <Shell />
}

export default function App() {
  useEffect(() => {
    applyStoredTheme()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<CallbackPage />} />
            <Route path="/invite/:token" element={<AcceptInvitePage />} />
            <Route element={<RequireAuth />}>
              <Route index element={<UsageOverviewPage />} />
              <Route path="gateway" element={<GatewayPage />} />
              <Route path="playground" element={<PlaygroundPage />} />
              <Route path="guide" element={<GuidePage />} />
              <Route path="keys" element={<Navigate to="/gateway" replace />} />
              <Route path="models" element={<Navigate to="/gateway" replace />} />
              <Route path="usage" element={<Navigate to="/" replace />} />
              <Route path="usage/llm" element={<Navigate to="/" replace />} />
              <Route path="settings" element={<SettingsGeneralPage />} />
              <Route path="theme" element={<Navigate to="/profile" replace />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route
                path="*"
                element={
                  <PlaceholderPage
                    title="Not Found"
                    description="This page does not exist."
                  />
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}
