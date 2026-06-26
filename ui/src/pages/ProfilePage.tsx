import type React from 'react'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'
import { VisualSelect } from '../components/ui/VisualSelect'
import { Avatar } from '../components/profile/Avatar'
import { useMe } from '../hooks/useMe'
import { useUpdateProfile, useChangePassword, useRemovePassword } from '../hooks/useProfile'
import { useUsage } from '../hooks/useUsage'
import { useToast } from '../hooks/useToast'
import { cn, formatCost, formatNumber, formatTokens } from '../lib/utils'
import {
  getStoredAvatar,
  isProfileSetupComplete,
  markProfileSetupComplete,
  saveAvatar,
  subscribeProfileChanges,
} from '../lib/profile'
import {
  applyStoredTheme,
  colorSlugFromTheme,
  getStoredTheme,
  getStoredThemeMode,
  nearestNipponColor,
  nipponColors,
  saveTheme,
  saveThemeMode,
  subscribeThemeChanges,
  themeNameForColor,
} from '../lib/theme'
import type { ThemeMode } from '../lib/theme'

function getLast30Days(): { from: string; to: string } {
  const now = new Date()
  const from = new Date(now.getTime() - 30 * 24 * 3_600_000)
  return { from: from.toISOString(), to: now.toISOString() }
}

function SettingsPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('zanellm-settings-panel rounded-xl', className)}>{children}</div>
}

function StatStrip({ requests, tokens, cost }: { requests: number; tokens: number; cost: number }) {
  const items = [
    { label: 'Requests 30d', value: formatNumber(requests) },
    { label: 'Tokens 30d', value: formatTokens(tokens) },
    { label: 'Cost 30d', value: formatCost(cost) },
  ]

  return (
    <div className="mx-auto grid max-w-[720px] grid-cols-3 overflow-hidden rounded-xl border border-border">
      {items.map((item) => (
        <div key={item.label} className="border-r border-border px-5 py-3 text-center last:border-r-0">
          <div className="text-base font-medium text-text-primary">{item.value}</div>
          <div className="mt-1 text-sm text-text-secondary">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

function readableTextColor(hex: string): string {
  const value = hex.replace('#', '')
  const red = Number.parseInt(value.slice(0, 2), 16)
  const green = Number.parseInt(value.slice(2, 4), 16)
  const blue = Number.parseInt(value.slice(4, 6), 16)
  return red * 0.299 + green * 0.587 + blue * 0.114 > 150 ? '#111111' : '#ffffff'
}

function IconSun() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8Z" />
    </svg>
  )
}

function ThemeSetupSection() {
  const storedTheme = useSyncExternalStore(subscribeThemeChanges, getStoredTheme, () => themeNameForColor('kuro', 'dark'))
  const selectedColor = colorSlugFromTheme(storedTheme)
  const mode = getStoredThemeMode()
  const colorOptions = nipponColors.map((color) => ({
    value: color.slug,
    label: color.label,
    description: `${color.japanese} / ${color.hex}`,
    searchText: `${color.japanese} ${color.hex}`,
    icon: (
      <span
        aria-hidden="true"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-xs font-semibold"
        style={{ backgroundColor: color.hex, color: readableTextColor(color.hex) }}
      >
        Aa
      </span>
    ),
  }))

  function chooseColor(slug: string) {
    saveTheme(themeNameForColor(slug, mode))
    applyStoredTheme()
  }

  function chooseMode(nextMode: ThemeMode) {
    saveThemeMode(nextMode)
    applyStoredTheme()
  }

  return (
    <SettingsPanel>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-base font-medium text-text-primary">Theme</h2>
          <p className="mt-1 text-sm text-text-tertiary">Choose the app palette and mode.</p>
        </div>
      </div>
      <div className="p-4">
        <VisualSelect
          label="Nippon color"
          searchable
          options={colorOptions}
          value={selectedColor}
          onChange={chooseColor}
        />
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-border bg-bg-tertiary p-1">
          {([
            { value: 'light' as const, label: 'Light', icon: <IconSun /> },
            { value: 'dark' as const, label: 'Dark', icon: <IconMoon /> },
          ]).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => chooseMode(item.value)}
              className={cn(
                'flex h-9 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors',
                mode === item.value
                  ? 'bg-bg-secondary text-text-primary shadow-sm'
                  : 'text-text-tertiary hover:bg-bg-secondary hover:text-text-primary',
              )}
              aria-pressed={mode === item.value}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </SettingsPanel>
  )
}

function sampleAvatarThemeColor(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const size = 64
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        reject(new Error('Canvas is unavailable'))
        return
      }
      ctx.drawImage(image, 0, 0, size, size)
      const { data } = ctx.getImageData(0, 0, size, size)
      let r = 0
      let g = 0
      let b = 0
      let weight = 0

      for (let index = 0; index < data.length; index += 4) {
        const alpha = data[index + 3] / 255
        if (alpha < 0.18) continue
        const pr = data[index]
        const pg = data[index + 1]
        const pb = data[index + 2]
        const brightness = (pr + pg + pb) / 3
        const saturation = Math.max(pr, pg, pb) - Math.min(pr, pg, pb)
        const pixelWeight = alpha * (0.35 + saturation / 255) * (brightness > 245 || brightness < 8 ? 0.35 : 1)
        r += pr * pixelWeight
        g += pg * pixelWeight
        b += pb * pixelWeight
        weight += pixelWeight
      }

      if (weight <= 0) {
        resolve('#080808')
        return
      }

      const toHex = (value: number) => Math.round(value / weight).toString(16).padStart(2, '0')
      resolve(`#${toHex(r)}${toHex(g)}${toHex(b)}`)
    }
    image.onerror = () => reject(new Error('Image could not be read'))
    image.src = dataUrl
  })
}

function ProfileSetupSection({
  userId,
  initialDisplayName,
  setup = false,
  onFinishSetup,
}: {
  userId: string
  initialDisplayName: string
  setup?: boolean
  onFinishSetup?: () => void
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [displayNameError, setDisplayNameError] = useState<string | undefined>()
  const avatar = useSyncExternalStore(subscribeProfileChanges, getStoredAvatar, () => null)
  const updateProfile = useUpdateProfile()
  const { toast } = useToast()
  const isDirty = displayName.trim() !== initialDisplayName

  function handleAvatarFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'error', message: 'Choose an image file' })
      return
    }
    if (file.size > 900_000) {
      toast({ variant: 'error', message: 'Image must be under 900 KB' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      saveAvatar(result)
      if (!result) return

      void sampleAvatarThemeColor(result)
        .then((hex) => {
          const color = nearestNipponColor(hex)
          saveTheme(themeNameForColor(color.slug, getStoredThemeMode()))
          applyStoredTheme()
          toast({ variant: 'success', message: `Theme matched to ${color.label}` })
        })
        .catch(() => {
          toast({ variant: 'success', message: 'Profile picture updated' })
        })
    }
    reader.readAsDataURL(file)
  }

  function saveName(): Promise<void> {
    const trimmed = displayName.trim()
    if (!trimmed) {
      setDisplayNameError('Display name is required')
      return Promise.reject(new Error('Display name is required'))
    }
    setDisplayNameError(undefined)
    if (!isDirty) return Promise.resolve()
    return new Promise((resolve, reject) => {
      updateProfile.mutate(
        { userId, params: { display_name: trimmed } },
        {
          onSuccess: () => {
            toast({ variant: 'success', message: 'Profile updated' })
            resolve()
          },
          onError: (err) => {
            toast({
              variant: 'error',
              message: err instanceof Error ? err.message : 'Failed to update profile',
            })
            reject(err)
          },
        },
      )
    })
  }

  return (
    <SettingsPanel>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void saveName()
        }}
        noValidate
      >
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-medium text-text-primary">Profile</h2>
        </div>
        <div className="space-y-5 p-4">
          <div className="flex items-center gap-4">
            <Avatar name={displayName} src={avatar} size="lg" />
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg-primary hover:opacity-90">
                Choose picture
                <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarFile} />
              </label>
              <Button type="button" variant="secondary" onClick={() => saveAvatar(null)}>
                Remove
              </Button>
            </div>
          </div>
          <Input
            label="Display name"
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value)
              if (displayNameError) setDisplayNameError(undefined)
            }}
            error={displayNameError}
            disabled={updateProfile.isPending}
          />
          <div className="flex justify-end">
            {setup ? (
              <Button
                type="button"
                loading={updateProfile.isPending}
                onClick={() => {
                  void saveName().then(onFinishSetup)
                }}
              >
                Continue
              </Button>
            ) : (
              <Button type="submit" loading={updateProfile.isPending} disabled={!isDirty}>
                Save profile
              </Button>
            )}
          </div>
        </div>
      </form>
    </SettingsPanel>
  )
}

function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPasswordError, setCurrentPasswordError] = useState<string | undefined>()
  const [newPasswordError, setNewPasswordError] = useState<string | undefined>()
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>()
  const changePassword = useChangePassword()
  const { toast } = useToast()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    let hasError = false
    if (!newPassword) {
      setNewPasswordError('New password is required')
      hasError = true
    } else if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters')
      hasError = true
    }
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your new password')
      hasError = true
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      hasError = true
    }
    if (hasError) return

    changePassword.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          toast({ variant: 'success', message: 'Password changed' })
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : 'Failed to change password'
          if (message.toLowerCase().includes('current password')) setCurrentPasswordError(message)
          else toast({ variant: 'error', message })
        },
      },
    )
  }

  return (
    <SettingsPanel className="lg:col-span-2">
      <form onSubmit={handleSubmit} noValidate>
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-medium text-text-primary">Password</h2>
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-3">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value)
              if (currentPasswordError) setCurrentPasswordError(undefined)
            }}
            error={currentPasswordError}
            disabled={changePassword.isPending}
            autoComplete="current-password"
            description="Leave empty if the password was removed."
            className="py-2"
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value)
              if (newPasswordError) setNewPasswordError(undefined)
            }}
            error={newPasswordError}
            disabled={changePassword.isPending}
            autoComplete="new-password"
            description="At least 8 characters"
            className="py-2"
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value)
              if (confirmPasswordError) setConfirmPasswordError(undefined)
            }}
            error={confirmPasswordError}
            disabled={changePassword.isPending}
            autoComplete="new-password"
            className="py-2"
          />
          <div className="flex justify-end lg:col-span-3">
            <Button type="submit" loading={changePassword.isPending}>
              Change Password
            </Button>
          </div>
        </div>
      </form>
    </SettingsPanel>
  )
}

function PasswordChoiceDialog({
  onKeep,
  onRemoved,
}: {
  onKeep: () => void
  onRemoved: () => void
}) {
  const removePassword = useRemovePassword()
  const { toast } = useToast()

  return (
    <Dialog open onClose={onKeep} title="Password preference">
      <div className="space-y-4">
        <p className="text-sm leading-6 text-text-secondary">
          Keep the login password, or remove it so this local dashboard can be opened without typing a password.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onKeep} disabled={removePassword.isPending}>
            Keep password
          </Button>
          <Button
            variant="primary"
            loading={removePassword.isPending}
            onClick={() => {
              removePassword.mutate(undefined, {
                onSuccess: () => {
                  toast({ variant: 'success', message: 'Password removed' })
                  onRemoved()
                },
                onError: (err) =>
                  toast({
                    variant: 'error',
                    message: err instanceof Error ? err.message : 'Failed to remove password',
                  }),
              })
            }}
          >
            Remove password
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default function ProfilePage() {
  const { data: me, isLoading } = useMe()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setup = searchParams.get('setup') === '1'
  const [showPasswordChoice, setShowPasswordChoice] = useState(false)
  const avatar = useSyncExternalStore(subscribeProfileChanges, getStoredAvatar, () => null)
  const { from, to } = useMemo(() => getLast30Days(), [])
  const usage = useUsage(me?.org_id ?? '', from, to, 'day')

  const totals = useMemo(() => {
    return (usage.data?.data ?? []).reduce(
      (acc, item) => ({
        requests: acc.requests + item.total_requests,
        tokens: acc.tokens + item.total_tokens,
        cost: acc.cost + item.cost_estimate,
      }),
      { requests: 0, tokens: 0, cost: 0 },
    )
  }, [usage.data?.data])

  useEffect(() => {
    if (!isLoading && me && setup && isProfileSetupComplete()) {
      navigate('/', { replace: true })
    }
  }, [isLoading, me, navigate, setup])

  if (isLoading || !me) {
    return (
      <div className="mx-auto max-w-[920px] pt-20">
        <PageHeader title="Profile" />
        <div className="zanellm-settings-panel h-60 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[920px] pt-4 pb-8">
      <PageHeader
        title={setup ? 'Set up your profile' : 'Profile'}
        description={setup ? 'Choose your name, picture, and theme.' : undefined}
      />

      <div className="mb-5 flex flex-col items-center">
        <Avatar name={me.display_name} src={avatar} size="lg" className="mb-3" />
        <h1 className="text-2xl font-medium text-text-primary">{me.display_name}</h1>
        <p className="mt-1 text-base text-text-tertiary">ZaneLLM user</p>
      </div>

      {!setup && (
        <div className="mb-4">
          <StatStrip requests={totals.requests} tokens={totals.tokens} cost={totals.cost} />
        </div>
      )}

      <div className="mx-auto grid max-w-[920px] gap-4 lg:grid-cols-2">
        <ProfileSetupSection
          userId={me.id}
          initialDisplayName={me.display_name}
          setup={setup}
          onFinishSetup={() => {
            setShowPasswordChoice(true)
          }}
        />
        <ThemeSetupSection />
        {!setup && <ChangePasswordSection />}
      </div>

      {setup && showPasswordChoice && (
        <PasswordChoiceDialog
          onKeep={() => {
            markProfileSetupComplete()
            navigate('/')
          }}
          onRemoved={() => {
            markProfileSetupComplete()
            navigate('/')
          }}
        />
      )}
    </div>
  )
}
