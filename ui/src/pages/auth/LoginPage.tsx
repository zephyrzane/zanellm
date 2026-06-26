import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Banner } from '../../components/ui/Banner'
import { LOCAL_STORAGE_KEY } from '../../lib/constants'
import { isProfileSetupComplete } from '../../lib/profile'
import type { MeResponse } from '../../hooks/useMe'

const modelLogos = [
  { label: 'OpenAI', src: '/provider-logos/openai.svg' },
  { label: 'Anthropic', src: '/provider-logos/anthropic.svg' },
  { label: 'Gemini', src: '/provider-logos/gemini.svg' },
  { label: 'Vertex', src: '/provider-logos/googlecloud.svg' },
  { label: 'OpenRouter', src: '/provider-logos/openrouter.svg' },
  { label: 'DeepSeek', src: '/provider-logos/deepseek.svg' },
  { label: 'Qwen', src: '/provider-logos/qwen.svg' },
  { label: 'Z.ai', src: '/z-ai-logo.svg' },
  { label: 'Mistral', src: '/provider-logos/mistral.svg' },
  { label: 'Perplexity', src: '/provider-logos/perplexity.svg' },
  { label: 'NVIDIA', src: '/provider-logos/nvidia.svg' },
  { label: 'Ollama', src: '/provider-logos/ollama.svg' },
]

function ModelLogo({ label, src }: { label: string; src: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-bg-secondary px-2 py-1.5">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-bg-tertiary">
        <img src={src} alt="" className="h-4 w-4 object-contain" aria-hidden="true" />
      </span>
      <span className="truncate text-[11px] text-text-tertiary">{label}</span>
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [password, setPassword] = useState('3214')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const finishLogin = useCallback((data: { token: string; expires_at: string; user: MeResponse }) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, data.token)
    queryClient.setQueryData(['me'], data.user)
    navigate(isProfileSetupComplete() ? '/' : '/profile?setup=1')
  }, [navigate, queryClient])

  useEffect(() => {
    let cancelled = false

    async function autoLoginWithoutPassword() {
      try {
        const res = await fetch('/api/v1/auth/passwordless-login', { method: 'POST' })
        if (!res.ok || cancelled) return
        finishLogin((await res.json()) as { token: string; expires_at: string; user: MeResponse })
      } catch {
        // Passwordless mode is optional. If it is not enabled, show the normal password form.
      }
    }

    void autoLoginWithoutPassword()
    return () => {
      cancelled = true
    }
  }, [finishLogin])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/password-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: { message: res.statusText } }))
        setError((body as { error?: { message?: string } })?.error?.message ?? 'Login failed')
        return
      }

      finishLogin((await res.json()) as { token: string; expires_at: string; user: MeResponse })
    } catch {
      setError('Unable to reach the server. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid h-screen overflow-hidden bg-bg-primary px-4 py-4 text-text-primary sm:px-6 lg:px-8">
      <main className="mx-auto grid h-full w-full max-w-4xl place-items-center">
        <section className="zanellm-panel w-full p-8 sm:p-10">
          <div className="text-center">
            <h1 className="text-5xl font-semibold leading-none tracking-normal text-text-primary sm:text-6xl">
              ZaneLLM
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-text-secondary">
              Local LLM gateway for providers, routing, API keys, and usage.
            </p>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto mt-9 max-w-md space-y-6">
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              description="Default password is 3214. You can change it in Profile, or remove it there so future visits open the dashboard directly."
            />

            {error !== null && <Banner variant="error" title={error} />}

            <Button type="submit" loading={loading} fullWidth size="lg">
              Sign in
            </Button>
          </form>

          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {modelLogos.map((logo) => (
              <ModelLogo key={logo.label} {...logo} />
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-3xl text-right font-mono text-xs uppercase tracking-[0.28em] text-text-tertiary">
            AD INTELLECTUM PER PORTAM SECURAM
          </p>
        </section>
      </main>
    </div>
  )
}
