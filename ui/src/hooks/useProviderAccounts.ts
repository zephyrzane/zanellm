import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'

export interface ProviderAccountResponse {
  id: string
  name: string
  provider: string
  auth_type: string
  base_url: string
  secret_hint: string
  priority: number
  weight: number
  concurrency_limit: number
  requests_per_minute: number
  tokens_per_minute: number
  is_active: boolean
  schedulable: boolean
  status: string
  error_message?: string
  rate_limited_until?: string
  quota_reset_at?: string
  last_used_at?: string
  last_tested_at?: string
  extra: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ImportProviderModelsResponse {
  imported: string[]
  updated: string[]
  skipped: string[]
}

interface PaginatedProviderAccounts {
  data: ProviderAccountResponse[]
  has_more: boolean
  next_cursor?: string
}

export interface CreateProviderAccountParams {
  name: string
  provider: string
  auth_type: string
  base_url?: string
  secret?: string
  priority?: number
  weight?: number
  concurrency_limit?: number
  requests_per_minute?: number
  tokens_per_minute?: number
  extra?: Record<string, unknown>
}

export type UpdateProviderAccountParams = Partial<CreateProviderAccountParams> & {
  is_active?: boolean
  schedulable?: boolean
  status?: string
}

export function useProviderAccounts(cursor?: string) {
  const params = new URLSearchParams({ limit: '100' })
  if (cursor) params.set('cursor', cursor)
  return useQuery({
    queryKey: ['provider-accounts', cursor],
    queryFn: () => apiClient<PaginatedProviderAccounts>(`/provider-accounts?${params}`),
  })
}

export function useCreateProviderAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: CreateProviderAccountParams) =>
      apiClient<ProviderAccountResponse>('/provider-accounts', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['provider-accounts'] }),
  })
}

export function useUpdateProviderAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ accountId, params }: { accountId: string; params: UpdateProviderAccountParams }) =>
      apiClient<ProviderAccountResponse>(`/provider-accounts/${accountId}`, {
        method: 'PATCH',
        body: JSON.stringify(params),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['provider-accounts'] }),
  })
}

export function useImportProviderModels() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (accountId: string) =>
      apiClient<ImportProviderModelsResponse>(`/provider-accounts/${accountId}/import-models`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['models'] })
      queryClient.invalidateQueries({ queryKey: ['available-models'] })
    },
  })
}

export function useDeleteProviderAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (accountId: string) =>
      apiClient<void>(`/provider-accounts/${accountId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['provider-accounts'] }),
  })
}
