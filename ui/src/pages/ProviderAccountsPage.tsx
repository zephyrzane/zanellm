import { useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { ConfirmDialog, Dialog } from '../components/ui/Dialog'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Table } from '../components/ui/Table'
import type { Column } from '../components/ui/Table'
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
  { value: 'cli', label: 'CLI account' },
  { value: 'session', label: 'Session token' },
  { value: 'none', label: 'No secret' },
]

const accountProviders = [
  ...providerPresets.map((preset) => ({
    value: preset.key,
    label: preset.label,
    baseUrl: preset.baseUrl,
  })),
  { value: 'claude-code', label: 'Claude Code', baseUrl: '' },
  { value: 'codex', label: 'Codex', baseUrl: '' },
  { value: 'opencode', label: 'OpenCode', baseUrl: '' },
  { value: 'hermes', label: 'Hermes', baseUrl: '' },
]

function providerLabel(provider: string) {
  return accountProviders.find((item) => item.value === provider)?.label ?? provider
}

function logoForProvider(provider: string) {
  if (provider === 'claude-code') return providerLogoSrc.claude
  return providerLogoSrc[provider]
}

function ProviderLogo({ provider }: { provider: string }) {
  const src = logoForProvider(provider)
  if (!src) return null
  return <img src={src} alt="" className="h-5 w-5 object-contain" />
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
                    message: `Account updated, ${result.imported.length} imported, ${result.updated.length} updated`,
                  })
                },
                onError: (err) => toast({ variant: 'error', message: err instanceof Error ? err.message : 'Model import failed' }),
              })
            } else {
              toast({ variant: 'success', message: 'Account updated' })
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
                message: `Account added, ${result.imported.length} imported, ${result.updated.length} updated`,
              })
            },
            onError: (err) => toast({ variant: 'error', message: err instanceof Error ? err.message : 'Model import failed' }),
          })
        } else {
          toast({ variant: 'success', message: 'Account added' })
        }
        onClose()
      },
      onError: (err) => setError(err instanceof Error ? err.message : 'Create failed'),
    })
  }

  const isPending = createAccount.isPending || updateAccount.isPending || importModels.isPending

  return (
    <Dialog open onClose={onClose} title={isEdit ? 'Edit upstream account' : 'Add upstream account'}>
      <div className="space-y-4">
        {error && <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">{error}</div>}
        <Select
          label="Provider"
          searchable
          options={accountProviders.map((item) => ({ value: item.value, label: item.label }))}
          value={provider}
          onChange={chooseProvider}
          disabled={isPending}
        />
        <Select
          label="Auth"
          options={authOptions}
          value={authType}
          onChange={setAuthType}
          disabled={isPending}
        />
        <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} disabled={isPending} />
        <Input label="Base URL" value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} disabled={isPending} />
        <Input
          label={isEdit ? 'Replace secret' : 'Secret'}
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
          <Button onClick={handleSubmit} loading={isPending}>{isEdit ? 'Save' : 'Add account'}</Button>
        </div>
      </div>
    </Dialog>
  )
}

export default function ProviderAccountsPage() {
  const { data, isLoading } = useProviderAccounts()
  const [showDialog, setShowDialog] = useState(false)
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
      header: 'Account',
      width: 'w-[30%]',
      render: (row) => (
        <div className="flex items-center gap-3">
          <ProviderLogo provider={row.provider} />
          <div className="min-w-0">
            <div className="font-medium text-text-primary">{row.name}</div>
            <div className="text-xs text-text-tertiary">{providerLabel(row.provider)} · {row.auth_type}</div>
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
                { onSuccess: () => toast({ variant: 'success', message: row.is_active ? 'Account paused' : 'Account resumed' }) },
              )
            }}
          >
            {row.is_active ? 'Pause' : 'Resume'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            loading={importModels.isPending}
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
      <div className="flex items-start justify-between border-b border-white/[0.08] px-4 py-4">
        <div>
          <h2 className="text-base font-medium text-text-primary">Upstream accounts</h2>
          <p className="mt-1 text-sm text-text-tertiary">Provider API keys, OAuth identities, and CLI accounts.</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>Add account</Button>
      </div>

      <div className="p-4">
        <Table
          columns={columns}
          data={accounts}
          keyExtractor={(row) => row.id}
          loading={isLoading}
          emptyMessage="No upstream accounts yet."
          compact
        />
      </div>

      {showDialog && <AccountDialog onClose={() => setShowDialog(false)} />}
      {editing && <AccountDialog account={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return
          deleteAccount.mutate(deleteId, {
            onSuccess: () => {
              toast({ variant: 'success', message: 'Account deleted' })
              setDeleteId(null)
            },
          })
        }}
        title="Delete upstream account"
        description="This removes the encrypted account secret and routing metadata."
        confirmLabel="Delete"
        loading={deleteAccount.isPending}
      />
    </>
  )
}
