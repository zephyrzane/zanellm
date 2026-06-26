import { useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { ConfirmDialog, Dialog } from '../components/ui/Dialog'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Table } from '../components/ui/Table'
import type { Column } from '../components/ui/Table'
import { Textarea } from '../components/ui/Textarea'
import { VisualSelect } from '../components/ui/VisualSelect'
import {
  useCreateProviderAccount,
  useDeleteProviderAccount,
  useImportProviderModels,
  useProviderAccounts,
  useUpdateProviderAccount,
} from '../hooks/useProviderAccounts'
import type { ProviderAccountResponse } from '../hooks/useProviderAccounts'
import { useToast } from '../hooks/useToast'
import { providerLogoSrc, providerPresets } from '../lib/providers'

const authOptions = [
  { value: 'api_key', label: 'API key' },
  { value: 'oauth', label: 'OAuth' },
  { value: 'setup-token', label: 'Setup token' },
  { value: 'cli', label: 'CLI login' },
  { value: 'session', label: 'Session token' },
  { value: 'service_account', label: 'Service account' },
  { value: 'bedrock', label: 'Bedrock' },
  { value: 'none', label: 'No secret' },
]

const apiAuthOptions = authOptions.filter((item) => ['api_key', 'oauth', 'cli', 'session', 'none'].includes(item.value))

const accountProviders = [
  ...providerPresets.map((preset) => ({
    value: preset.key,
    label: preset.label,
    baseUrl: preset.baseUrl,
    shortLabel: preset.shortLabel,
  })),
  { value: 'claude-code', label: 'Claude Code', baseUrl: '', shortLabel: 'CC' },
  { value: 'codex', label: 'Codex', baseUrl: '', shortLabel: 'Cx' },
  { value: 'opencode', label: 'OpenCode', baseUrl: '', shortLabel: 'OC' },
  { value: 'hermes', label: 'Hermes', baseUrl: '', shortLabel: 'He' },
]

const accountPlatformOptions = [
  { value: 'anthropic', label: 'Anthropic', baseUrl: 'https://api.anthropic.com', shortLabel: 'A' },
  { value: 'openai', label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', shortLabel: 'OA' },
  { value: 'gemini', label: 'Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', shortLabel: 'G' },
  { value: 'antigravity', label: 'Antigravity', baseUrl: '', shortLabel: 'Ag' },
  { value: 'claude-code', label: 'Claude Code', baseUrl: '', shortLabel: 'CC' },
  { value: 'codex', label: 'Codex CLI', baseUrl: '', shortLabel: 'Cx' },
  { value: 'gemini-cli', label: 'Gemini CLI', baseUrl: '', shortLabel: 'GC' },
  { value: 'opencode', label: 'OpenCode', baseUrl: '', shortLabel: 'OC' },
  { value: 'hermes', label: 'Hermes', baseUrl: '', shortLabel: 'He' },
  { value: 'kiro', label: 'Kiro', baseUrl: '', shortLabel: 'Ki' },
  { value: 'cursor', label: 'Cursor', baseUrl: '', shortLabel: 'Cu' },
  { value: 'windsurf', label: 'Windsurf', baseUrl: '', shortLabel: 'Ws' },
  { value: 'augment', label: 'Augment Code', baseUrl: '', shortLabel: 'Au' },
  { value: 'continue', label: 'Continue', baseUrl: '', shortLabel: 'Ct' },
  { value: 'cline', label: 'Cline', baseUrl: '', shortLabel: 'Cl' },
  { value: 'roo-code', label: 'Roo Code', baseUrl: '', shortLabel: 'Roo' },
  { value: 'aider', label: 'Aider', baseUrl: '', shortLabel: 'Ai' },
  { value: 'zed', label: 'Zed', baseUrl: '', shortLabel: 'Zd' },
  { value: 'vscode', label: 'VS Code', baseUrl: '', shortLabel: 'VS' },
  { value: 'openrouter', label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', shortLabel: 'OR' },
  { value: 'custom-account', label: 'Custom account', baseUrl: '', shortLabel: '+' },
]

const accountMethodOptions = [
  { value: 'oauth', label: 'OAuth refresh token' },
  { value: 'setup-token', label: 'Setup token' },
  { value: 'api_key', label: 'API key' },
  { value: 'session', label: 'Session token' },
  { value: 'cli', label: 'CLI login' },
  { value: 'service_account', label: 'Service account JSON' },
  { value: 'bedrock', label: 'AWS Bedrock' },
]

function providerLabel(provider: string) {
  return accountProviders.find((item) => item.value === provider)?.label
    ?? accountPlatformOptions.find((item) => item.value === provider)?.label
    ?? provider
}

function logoForProvider(provider: string) {
  if (provider === 'claude-code') return providerLogoSrc.claude
  if (provider === 'gemini-cli') return providerLogoSrc.gemini
  if (provider === 'custom-account') return providerLogoSrc.custom
  return providerLogoSrc[provider]
}

function ProviderLogo({ provider }: { provider: string }) {
  const [failed, setFailed] = useState(false)
  const src = logoForProvider(provider)
  if (!src || failed) return null
  return <img src={src} alt="" className="h-5 w-5 object-contain" onError={() => setFailed(true)} />
}

function ProviderMark({ provider, label }: { provider: string; label: string }) {
  const [failed, setFailed] = useState(false)
  const src = logoForProvider(provider)
  const shortLabel = accountProviders.find((item) => item.value === provider)?.shortLabel
    ?? accountPlatformOptions.find((item) => item.value === provider)?.shortLabel
    ?? label.slice(0, 2)
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-bg-tertiary text-[11px] font-semibold text-text-primary">
      {src && !failed ? (
        <img src={src} alt="" className="h-4 w-4 object-contain" onError={() => setFailed(true)} />
      ) : (
        shortLabel
      )}
    </span>
  )
}

function extraString(extra: Record<string, unknown> | undefined, key: string) {
  const value = extra?.[key]
  return typeof value === 'string' ? value : ''
}

function isStoredAccount(row: ProviderAccountResponse) {
  return extraString(row.extra, 'entry_kind') === 'account'
}

function rowKindLabel(row: ProviderAccountResponse) {
  if (!isStoredAccount(row)) return 'API channel'
  const method = accountMethodOptions.find((item) => item.value === row.auth_type)?.label ?? row.auth_type
  return method
}

function defaultBaseUrlForProvider(provider: string) {
  return accountProviders.find((item) => item.value === provider)?.baseUrl
    ?? accountPlatformOptions.find((item) => item.value === provider)?.baseUrl
    ?? ''
}

function defaultMethodForPlatform(platform: string) {
  if (['claude-code', 'codex', 'gemini-cli', 'opencode', 'hermes', 'kiro', 'cursor', 'windsurf', 'augment', 'continue', 'cline', 'roo-code', 'aider', 'zed', 'vscode'].includes(platform)) return 'cli'
  if (platform === 'gemini') return 'oauth'
  return 'oauth'
}

function parseJSONRecord(value: string): Record<string, unknown> | null {
  const trimmed = value.trim()
  if (!trimmed) return {}
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>
  } catch {
    return null
  }
  return null
}

interface AccountDialogProps {
  account?: ProviderAccountResponse
  onClose: () => void
}

function AccountDialog({ account, onClose }: AccountDialogProps) {
  const isEdit = account != null
  const [provider, setProvider] = useState(account?.provider ?? 'openai')
  const [authType, setAuthType] = useState(account?.auth_type ?? 'api_key')
  const [name, setName] = useState(account?.name ?? '')
  const [baseUrl, setBaseUrl] = useState(account?.base_url ?? accountProviders.find((item) => item.value === 'openai')?.baseUrl ?? '')
  const [secret, setSecret] = useState('')
  const [priority, setPriority] = useState(String(account?.priority ?? 50))
  const [weight, setWeight] = useState(String(account?.weight ?? 1))
  const [concurrency, setConcurrency] = useState(String(account?.concurrency_limit ?? 0))
  const [rpm, setRpm] = useState(String(account?.requests_per_minute ?? 0))
  const [tpm, setTpm] = useState(String(account?.tokens_per_minute ?? 0))
  const [error, setError] = useState<string | null>(null)
  const createAccount = useCreateProviderAccount()
  const updateAccount = useUpdateProviderAccount()
  const importModels = useImportProviderModels()
  const { toast } = useToast()

  function chooseProvider(next: string) {
    setProvider(next)
    const preset = accountProviders.find((item) => item.value === next)
    if (!isEdit && preset?.baseUrl) setBaseUrl(preset.baseUrl)
    if (!name.trim() && preset) setName(preset.label)
  }

  function parseNonNegative(value: string): number {
    const parsed = Number.parseInt(value, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  }

  function handleSubmit() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Name is required')
      return
    }
    setError(null)
    const params = {
      name: trimmedName,
      provider,
      auth_type: authType,
      base_url: baseUrl.trim(),
      secret: secret.trim() || undefined,
      priority: parseNonNegative(priority) || 50,
      weight: parseNonNegative(weight) || 1,
      concurrency_limit: parseNonNegative(concurrency),
      requests_per_minute: parseNonNegative(rpm),
      tokens_per_minute: parseNonNegative(tpm),
    }

    const shouldImport = authType !== 'none' && baseUrl.trim() !== '' && secret.trim() !== ''

    if (isEdit) {
      updateAccount.mutate(
        { accountId: account.id, params },
        {
          onSuccess: () => {
            if (shouldImport) {
              importModels.mutate(account.id, {
                onSuccess: (result) => {
                  toast({
                    variant: 'success',
                    message: `API channel updated, ${result.imported.length} imported, ${result.updated.length} updated`,
                  })
                },
                onError: (err) => toast({ variant: 'error', message: err instanceof Error ? err.message : 'Model import failed' }),
              })
            } else {
              toast({ variant: 'success', message: 'API channel updated' })
            }
            onClose()
          },
          onError: (err) => setError(err instanceof Error ? err.message : 'Update failed'),
        },
      )
      return
    }

    createAccount.mutate(params, {
      onSuccess: (created) => {
        if (shouldImport) {
          importModels.mutate(created.id, {
            onSuccess: (result) => {
              toast({
                variant: 'success',
                message: `API channel added, ${result.imported.length} imported, ${result.updated.length} updated`,
              })
            },
            onError: (err) => toast({ variant: 'error', message: err instanceof Error ? err.message : 'Model import failed' }),
          })
        } else {
          toast({ variant: 'success', message: 'API channel added' })
        }
        onClose()
      },
      onError: (err) => setError(err instanceof Error ? err.message : 'Create failed'),
    })
  }

  const isPending = createAccount.isPending || updateAccount.isPending || importModels.isPending

  return (
    <Dialog open onClose={onClose} title={isEdit ? 'Edit API channel' : 'Add API channel'}>
      <div className="space-y-4">
        {error && <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">{error}</div>}
        <VisualSelect
          label="Provider"
          searchable
          options={accountProviders.map((item) => ({
            value: item.value,
            label: item.label,
            description: item.baseUrl || 'Local CLI or custom API',
            searchText: item.value,
            icon: <ProviderMark provider={item.value} label={item.label} />,
          }))}
          value={provider}
          onChange={chooseProvider}
          disabled={isPending}
        />
        <Select
          label="Auth"
          options={apiAuthOptions}
          value={authType}
          onChange={setAuthType}
          disabled={isPending}
        />
        <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} disabled={isPending} />
        <Input label="Base URL" value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} disabled={isPending} />
        <Input
          label={isEdit ? 'Replace API secret' : 'API secret'}
          type="password"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          disabled={isPending || authType === 'none'}
          autoComplete="off"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Priority" type="number" value={priority} onChange={(event) => setPriority(event.target.value)} disabled={isPending} />
          <Input label="Weight" type="number" value={weight} onChange={(event) => setWeight(event.target.value)} disabled={isPending} />
          <Input label="Concurrency" type="number" value={concurrency} onChange={(event) => setConcurrency(event.target.value)} disabled={isPending} />
          <Input label="RPM" type="number" value={rpm} onChange={(event) => setRpm(event.target.value)} disabled={isPending} />
          <Input label="TPM" type="number" value={tpm} onChange={(event) => setTpm(event.target.value)} disabled={isPending} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isPending}>{isEdit ? 'Save' : 'Add API'}</Button>
        </div>
      </div>
    </Dialog>
  )
}

function AccountLoginDialog({ account, onClose }: AccountDialogProps) {
  const isEdit = account != null
  const [platform, setPlatform] = useState(account?.provider ?? 'anthropic')
  const [method, setMethod] = useState(account?.auth_type ?? defaultMethodForPlatform(account?.provider ?? 'anthropic'))
  const [name, setName] = useState(account?.name ?? '')
  const [baseUrl, setBaseUrl] = useState(account?.base_url ?? defaultBaseUrlForProvider(account?.provider ?? 'anthropic'))
  const [secret, setSecret] = useState('')
  const [notes, setNotes] = useState(extraString(account?.extra, 'notes'))
  const [credentialFields, setCredentialFields] = useState(() => {
    const fields = account?.extra?.credential_fields
    return fields && typeof fields === 'object' ? JSON.stringify(fields, null, 2) : ''
  })
  const [modelMapping, setModelMapping] = useState(() => {
    const mapping = account?.extra?.model_mapping
    return mapping && typeof mapping === 'object' ? JSON.stringify(mapping, null, 2) : ''
  })
  const [priority, setPriority] = useState(String(account?.priority ?? 50))
  const [weight, setWeight] = useState(String(account?.weight ?? 1))
  const [concurrency, setConcurrency] = useState(String(account?.concurrency_limit ?? 0))
  const [rpm, setRpm] = useState(String(account?.requests_per_minute ?? 0))
  const [tpm, setTpm] = useState(String(account?.tokens_per_minute ?? 0))
  const [error, setError] = useState<string | null>(null)
  const createAccount = useCreateProviderAccount()
  const updateAccount = useUpdateProviderAccount()
  const { toast } = useToast()

  const isPending = createAccount.isPending || updateAccount.isPending

  function choosePlatform(next: string) {
    setPlatform(next)
    const preset = accountPlatformOptions.find((item) => item.value === next)
    if (!isEdit) {
      setBaseUrl(preset?.baseUrl ?? '')
      setMethod(defaultMethodForPlatform(next))
    }
    if (!name.trim() && preset) setName(preset.label)
  }

  function parseNonNegative(value: string): number {
    const parsed = Number.parseInt(value, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  }

  function handleSubmit() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Name is required')
      return
    }
    const fields = parseJSONRecord(credentialFields)
    if (fields == null) {
      setError('Credential fields must be a JSON object')
      return
    }
    const mapping = parseJSONRecord(modelMapping)
    if (mapping == null) {
      setError('Model mapping must be a JSON object')
      return
    }

    setError(null)
    const extra: Record<string, unknown> = {
      entry_kind: 'account',
      source: '9router-account-form',
      account_platform: platform,
      account_method: method,
    }
    if (notes.trim()) extra.notes = notes.trim()
    if (Object.keys(fields).length > 0) extra.credential_fields = fields
    if (Object.keys(mapping).length > 0) extra.model_mapping = mapping

    const params = {
      name: trimmedName,
      provider: platform,
      auth_type: method,
      base_url: baseUrl.trim(),
      secret: secret.trim() || undefined,
      priority: parseNonNegative(priority) || 50,
      weight: parseNonNegative(weight) || 1,
      concurrency_limit: parseNonNegative(concurrency),
      requests_per_minute: parseNonNegative(rpm),
      tokens_per_minute: parseNonNegative(tpm),
      extra,
    }

    if (isEdit) {
      updateAccount.mutate(
        { accountId: account.id, params },
        {
          onSuccess: () => {
            toast({ variant: 'success', message: 'Account updated' })
            onClose()
          },
          onError: (err) => setError(err instanceof Error ? err.message : 'Update failed'),
        },
      )
      return
    }

    createAccount.mutate(params, {
      onSuccess: () => {
        toast({ variant: 'success', message: 'Account added' })
        onClose()
      },
      onError: (err) => setError(err instanceof Error ? err.message : 'Create failed'),
    })
  }

  return (
    <Dialog open onClose={onClose} title={isEdit ? 'Edit account' : 'Add account'}>
      <div className="space-y-4">
        {error && <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">{error}</div>}
        <VisualSelect
          label="Platform or client"
          searchable
          options={accountPlatformOptions.map((item) => ({
            value: item.value,
            label: item.label,
            description: item.baseUrl || 'OAuth, CLI, session, or local client account',
            searchText: item.value,
            icon: <ProviderMark provider={item.value} label={item.label} />,
          }))}
          value={platform}
          onChange={choosePlatform}
          disabled={isPending}
        />
        <Select label="Account method" options={accountMethodOptions} value={method} onChange={setMethod} disabled={isPending} />
        <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} disabled={isPending} />
        <Input label="Base URL" value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} disabled={isPending} />
        <Input
          label={isEdit ? 'Replace credential secret' : 'Credential secret'}
          type="password"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          disabled={isPending}
          autoComplete="off"
          description="API key, refresh token, setup token, session token, or service account JSON."
        />
        <Textarea
          label="Credential fields JSON"
          value={credentialFields}
          onChange={(event) => setCredentialFields(event.target.value)}
          rows={4}
          disabled={isPending}
          placeholder={'{\n  "client_id": "...",\n  "tier_id": "google_one_free"\n}'}
          description="Optional non-secret fields from the account flow."
        />
        <Textarea
          label="Model mapping JSON"
          value={modelMapping}
          onChange={(event) => setModelMapping(event.target.value)}
          rows={4}
          disabled={isPending}
          placeholder={'{\n  "claude-*": "claude-sonnet-4-5"\n}'}
          description="Optional 9router-style model whitelist or mapping data."
        />
        <Textarea label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} disabled={isPending} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Priority" type="number" value={priority} onChange={(event) => setPriority(event.target.value)} disabled={isPending} />
          <Input label="Weight" type="number" value={weight} onChange={(event) => setWeight(event.target.value)} disabled={isPending} />
          <Input label="Concurrency" type="number" value={concurrency} onChange={(event) => setConcurrency(event.target.value)} disabled={isPending} />
          <Input label="RPM" type="number" value={rpm} onChange={(event) => setRpm(event.target.value)} disabled={isPending} />
          <Input label="TPM" type="number" value={tpm} onChange={(event) => setTpm(event.target.value)} disabled={isPending} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isPending}>{isEdit ? 'Save' : 'Add account'}</Button>
        </div>
      </div>
    </Dialog>
  )
}

export default function ProviderAccountsPage() {
  const { data, isLoading } = useProviderAccounts()
  const [showApiDialog, setShowApiDialog] = useState(false)
  const [showAccountDialog, setShowAccountDialog] = useState(false)
  const [editing, setEditing] = useState<ProviderAccountResponse | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const updateAccount = useUpdateProviderAccount()
  const importModels = useImportProviderModels()
  const deleteAccount = useDeleteProviderAccount()
  const { toast } = useToast()
  const accounts = data?.data ?? []

  const columns: Column<ProviderAccountResponse>[] = useMemo(() => [
    {
      key: 'name',
      header: 'API',
      width: 'w-[30%]',
      render: (row) => (
        <div className="flex items-center gap-3">
          <ProviderLogo provider={row.provider} />
          <div className="min-w-0">
            <div className="font-medium text-text-primary">{row.name}</div>
            <div className="text-xs text-text-tertiary">{providerLabel(row.provider)} · {rowKindLabel(row)}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 'w-[12%]',
      render: (row) => (
        <span className={row.is_active && row.schedulable ? 'text-success' : 'text-text-tertiary'}>
          {row.is_active && row.schedulable ? row.status : 'paused'}
        </span>
      ),
    },
    {
      key: 'limits',
      header: 'Limits',
      width: 'w-[22%]',
      render: (row) => (
        <span className="font-mono text-xs text-text-secondary">
          p{row.priority} · w{row.weight} · c{row.concurrency_limit || '∞'} · {row.requests_per_minute || '∞'}rpm
        </span>
      ),
    },
    {
      key: 'secret',
      header: 'Secret',
      width: 'w-[16%]',
      render: (row) => <span className="font-mono text-xs text-text-tertiary">{row.secret_hint || 'none'}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: 'w-[20%]',
      render: (row) => (
        <div className="zanellm-table-actions">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              updateAccount.mutate(
                { accountId: row.id, params: { is_active: !row.is_active, schedulable: !row.is_active } },
                { onSuccess: () => toast({ variant: 'success', message: row.is_active ? 'API channel paused' : 'API channel resumed' }) },
              )
            }}
          >
            {row.is_active ? 'Pause' : 'Resume'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            loading={importModels.isPending}
            disabled={isStoredAccount(row)}
            onClick={() => {
              importModels.mutate(row.id, {
                onSuccess: (result) =>
                  toast({
                    variant: 'success',
                    message: `${result.imported.length} imported, ${result.updated.length} updated`,
                  }),
                onError: (err) => toast({ variant: 'error', message: err instanceof Error ? err.message : 'Import failed' }),
              })
            }}
          >
            Import
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setEditing(row)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteId(row.id)}>Delete</Button>
        </div>
      ),
    },
  ], [importModels, toast, updateAccount])

  return (
    <>
      <div className="flex items-start justify-between border-b border-border px-4 py-4">
        <div>
          <h2 className="text-base font-medium text-text-primary">Accounts and API channels</h2>
          <p className="mt-1 text-sm text-text-tertiary">9router-style accounts, CLI logins, provider API keys, and importable API channels.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowAccountDialog(true)}>Add account</Button>
          <Button onClick={() => setShowApiDialog(true)}>Add API channel</Button>
        </div>
      </div>

      <div className="p-4">
        <Table
          columns={columns}
          data={accounts}
          keyExtractor={(row) => row.id}
          loading={isLoading}
          emptyMessage="No accounts or API channels yet."
          compact
        />
      </div>

      {showApiDialog && <AccountDialog onClose={() => setShowApiDialog(false)} />}
      {showAccountDialog && <AccountLoginDialog onClose={() => setShowAccountDialog(false)} />}
      {editing && (
        isStoredAccount(editing)
          ? <AccountLoginDialog account={editing} onClose={() => setEditing(null)} />
          : <AccountDialog account={editing} onClose={() => setEditing(null)} />
      )}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return
          deleteAccount.mutate(deleteId, {
            onSuccess: () => {
              toast({ variant: 'success', message: 'Entry deleted' })
              setDeleteId(null)
            },
          })
        }}
        title="Delete entry"
        description="This removes the encrypted credential secret and routing metadata."
        confirmLabel="Delete"
        loading={deleteAccount.isPending}
      />
    </>
  )
}
