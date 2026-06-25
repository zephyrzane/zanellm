import type { BadgeProps } from '../components/ui/Badge'

export type ProviderKey = 'openai' | 'openai_responses' | 'anthropic' | 'azure' | 'gemini' | 'vertex' | 'vllm' | 'ollama' | 'custom'

export type ProviderPresetKey = string

export interface ProviderPreset {
  key: ProviderPresetKey
  label: string
  provider: ProviderKey
  baseUrl: string
  shortLabel: string
  accent: string
  tone: 'light' | 'dark'
}

export const providerLabels: Record<ProviderKey, string> = {
  openai: 'OpenAI',
  openai_responses: 'OpenAI Responses',
  anthropic: 'Anthropic',
  azure: 'Azure',
  gemini: 'Gemini',
  vertex: 'Vertex AI',
  vllm: 'vLLM',
  ollama: 'Ollama',
  custom: 'Custom',
}

export const providerPresets: ProviderPreset[] = [
  { key: 'openai', label: 'OpenAI', provider: 'openai', baseUrl: 'https://api.openai.com/v1', shortLabel: 'OA', accent: '#ffffff', tone: 'light' },
  { key: 'openai_responses', label: 'OpenAI Responses', provider: 'openai_responses', baseUrl: 'https://api.openai.com/v1', shortLabel: 'ORs', accent: '#ffffff', tone: 'light' },
  { key: 'anthropic', label: 'Anthropic', provider: 'anthropic', baseUrl: 'https://api.anthropic.com', shortLabel: 'A', accent: '#d6c3ad', tone: 'light' },
  { key: 'azure', label: 'Azure OpenAI', provider: 'azure', baseUrl: '', shortLabel: 'Az', accent: '#47a7ff', tone: 'dark' },
  { key: 'gemini', label: 'Gemini', provider: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', shortLabel: 'G', accent: '#8ab4f8', tone: 'dark' },
  { key: 'vertex', label: 'Vertex AI', provider: 'vertex', baseUrl: '', shortLabel: 'Vx', accent: '#34a853', tone: 'dark' },
  { key: 'openrouter', label: 'OpenRouter', provider: 'custom', baseUrl: 'https://openrouter.ai/api/v1', shortLabel: 'OR', accent: '#f7f7f7', tone: 'light' },
  { key: 'mistral', label: 'Mistral', provider: 'custom', baseUrl: 'https://api.mistral.ai/v1', shortLabel: 'M', accent: '#ffaf45', tone: 'dark' },
  { key: 'groq', label: 'Groq', provider: 'custom', baseUrl: 'https://api.groq.com/openai/v1', shortLabel: 'Gq', accent: '#ff4d2e', tone: 'dark' },
  { key: 'cohere', label: 'Cohere', provider: 'custom', baseUrl: 'https://api.cohere.com/compatibility/v1', shortLabel: 'Co', accent: '#27d6a2', tone: 'dark' },
  { key: 'perplexity', label: 'Perplexity', provider: 'custom', baseUrl: 'https://api.perplexity.ai', shortLabel: 'P', accent: '#20c7b5', tone: 'dark' },
  { key: 'xai', label: 'xAI', provider: 'custom', baseUrl: 'https://api.x.ai/v1', shortLabel: 'x', accent: '#f5f5f5', tone: 'light' },
  { key: 'together', label: 'Together', provider: 'custom', baseUrl: 'https://api.together.xyz/v1', shortLabel: 'T', accent: '#7c5cff', tone: 'dark' },
  { key: 'fireworks', label: 'Fireworks', provider: 'custom', baseUrl: 'https://api.fireworks.ai/inference/v1', shortLabel: 'Fw', accent: '#ff6b4a', tone: 'dark' },
  { key: 'deepseek', label: 'DeepSeek', provider: 'custom', baseUrl: 'https://api.deepseek.com/v1', shortLabel: 'DS', accent: '#4d7cff', tone: 'dark' },
  { key: 'kimi', label: 'Kimi / Moonshot', provider: 'custom', baseUrl: 'https://api.moonshot.ai/v1', shortLabel: 'Ki', accent: '#18c6ff', tone: 'dark' },
  { key: 'qwen', label: 'Qwen / DashScope', provider: 'custom', baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1', shortLabel: 'Qw', accent: '#625dff', tone: 'dark' },
  { key: 'minimax', label: 'MiniMax', provider: 'custom', baseUrl: 'https://api.minimax.io/v1', shortLabel: 'Mx', accent: '#27c2ff', tone: 'dark' },
  { key: 'baidu', label: 'Baidu Qianfan', provider: 'custom', baseUrl: 'https://qianfan.baidubce.com/v2', shortLabel: 'Bd', accent: '#2f6bff', tone: 'dark' },
  { key: 'volcengine', label: 'Volcengine Ark', provider: 'custom', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', shortLabel: 'Vk', accent: '#5b8cff', tone: 'dark' },
  { key: 'siliconflow', label: 'SiliconFlow', provider: 'custom', baseUrl: 'https://api.siliconflow.cn/v1', shortLabel: 'SF', accent: '#13d681', tone: 'dark' },
  { key: 'stepfun', label: 'StepFun', provider: 'custom', baseUrl: 'https://api.stepfun.com/v1', shortLabel: 'St', accent: '#ff5f87', tone: 'dark' },
  { key: 'tencent', label: 'Tencent Hunyuan', provider: 'custom', baseUrl: 'https://api.hunyuan.cloud.tencent.com/v1', shortLabel: 'Hy', accent: '#3478ff', tone: 'dark' },
  { key: 'nvidia', label: 'NVIDIA NIM', provider: 'custom', baseUrl: 'https://integrate.api.nvidia.com/v1', shortLabel: 'Nv', accent: '#76b900', tone: 'dark' },
  { key: 'sambanova', label: 'SambaNova', provider: 'custom', baseUrl: 'https://api.sambanova.ai/v1', shortLabel: 'SN', accent: '#ff245d', tone: 'dark' },
  { key: 'ai21', label: 'AI21', provider: 'custom', baseUrl: 'https://api.ai21.com/studio/v1', shortLabel: '21', accent: '#ffffff', tone: 'light' },
  { key: 'voyage', label: 'Voyage AI', provider: 'custom', baseUrl: 'https://api.voyageai.com/v1', shortLabel: 'Vo', accent: '#8fe6ff', tone: 'dark' },
  { key: 'jina', label: 'Jina AI', provider: 'custom', baseUrl: 'https://api.jina.ai/v1', shortLabel: 'Ji', accent: '#ffe761', tone: 'dark' },
  { key: 'cerebras', label: 'Cerebras', provider: 'custom', baseUrl: 'https://api.cerebras.ai/v1', shortLabel: 'Cb', accent: '#f6c744', tone: 'dark' },
  { key: 'huggingface', label: 'Hugging Face', provider: 'custom', baseUrl: 'https://router.huggingface.co/v1', shortLabel: 'HF', accent: '#ffd21f', tone: 'dark' },
  { key: 'nebius', label: 'Nebius', provider: 'custom', baseUrl: 'https://api.studio.nebius.com/v1', shortLabel: 'N', accent: '#b6ff4a', tone: 'dark' },
  { key: 'zai', label: 'Z.ai', provider: 'custom', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', shortLabel: 'Z', accent: '#ffffff', tone: 'light' },
  { key: 'vllm', label: 'vLLM', provider: 'vllm', baseUrl: 'http://localhost:8000/v1', shortLabel: 'v', accent: '#74e0ff', tone: 'dark' },
  { key: 'ollama', label: 'Ollama', provider: 'ollama', baseUrl: 'http://localhost:11434/v1', shortLabel: 'Ol', accent: '#e8e8e8', tone: 'light' },
  { key: 'custom', label: 'Custom', provider: 'custom', baseUrl: '', shortLabel: '+', accent: '#8a8f98', tone: 'dark' },
]

export const providerBadgeVariant: Record<ProviderKey, NonNullable<BadgeProps['variant']>> = {
  openai: 'default',
  openai_responses: 'default',
  anthropic: 'info',
  azure: 'warning',
  gemini: 'info',
  vertex: 'success',
  vllm: 'success',
  ollama: 'success',
  custom: 'muted',
}

export const providerLogoSrc: Record<string, string> = {
  openai: '/provider-logos/openai.svg',
  openai_responses: '/provider-logos/openai.svg',
  anthropic: '/provider-logos/anthropic.svg',
  gemini: '/provider-logos/gemini.svg',
  vertex: '/provider-logos/googlecloud.svg',
  openrouter: '/provider-logos/openrouter.svg',
  codex: '/provider-logos/codex.png',
  claude: '/provider-logos/claude.png',
  opencode: '/provider-logos/opencode.png',
  hermes: '/provider-logos/hermes.png',
  deepseek: '/provider-logos/deepseek.svg',
  qwen: '/provider-logos/qwen.svg',
  zai: '/z-ai-logo.svg',
  kimi: '/provider-logos/kimi.png',
  mistral: '/provider-logos/mistral.svg',
  groq: '/provider-logos/groq.png',
  together: '/provider-logos/together.png',
  fireworks: '/provider-logos/fireworks.png',
  cohere: '/provider-logos/cohere.png',
  xai: '/provider-logos/xai.png',
  perplexity: '/provider-logos/perplexity.svg',
  nvidia: '/provider-logos/nvidia.svg',
  ollama: '/provider-logos/ollama.svg',
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

export function isKnownProvider(v: string): v is ProviderKey {
  return v in providerBadgeVariant
}

export function labelForProvider(provider: string, baseUrl?: string): string {
  if (provider === 'custom' && baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl)
    const preset = providerPresets.find((p) => p.provider === 'custom' && p.baseUrl && normalizeBaseUrl(p.baseUrl) === normalized)
    if (preset) return preset.label
  }
  return isKnownProvider(provider) ? providerLabels[provider] : provider
}
