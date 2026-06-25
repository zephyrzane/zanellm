import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/client'
import { Dialog } from '../components/ui/Dialog'
import { PageHeader } from '../components/ui/PageHeader'

interface AvailableModel {
  name: string
  type: string
}

interface AvailableModelsResponse {
  models: AvailableModel[]
}

interface GuideCard {
  id: string
  title: string
  image: string
  surface: string
  tested: string[]
  commands: string[]
  notes: string[]
  source?: string
}

function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-white/[0.08] bg-black px-3 py-3 font-mono text-xs leading-5 text-text-secondary">
      {lines.join('\n')}
    </pre>
  )
}

function GuideTile({ card, onOpen }: { card: GuideCard; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group min-h-[168px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0b0b0b] text-left transition-all duration-150 hover:border-white/[0.22] hover:bg-[#101010] hover:shadow-[0_18px_55px_rgba(0,0,0,0.36)]"
    >
      <div className="flex h-20 items-center justify-center border-b border-white/[0.08] bg-black">
        <img
          src={card.image}
          alt=""
          className="h-12 w-12 object-contain opacity-85 transition-transform duration-200 group-hover:scale-110 group-hover:opacity-100"
        />
      </div>
      <div className="p-3.5">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-text-tertiary">{card.surface}</div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <h2 className="truncate text-lg font-medium text-text-primary">{card.title}</h2>
          <span className="rounded-sm border border-success/30 bg-success/10 px-2 py-1 text-xs font-medium text-success">
            Working
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-5 text-text-tertiary">{card.notes[0]}</p>
      </div>
    </button>
  )
}

function GuideDialog({ card, onClose }: { card: GuideCard; onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} title={card.title} className="space-y-5" closeOnBackdrop>
      <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-black p-4">
        <img src={card.image} alt="" className="h-12 w-12 object-contain" />
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-text-tertiary">{card.surface}</div>
          <div className="mt-1 text-sm text-success">Working</div>
        </div>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-medium text-text-primary">Tested here</h3>
        <ul className="space-y-1 text-sm leading-5 text-text-tertiary">
          {card.tested.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium text-text-primary">Commands</h3>
        <CodeBlock lines={card.commands} />
      </section>

      <section>
        <h3 className="mb-2 text-sm font-medium text-text-primary">Notes</h3>
        <ul className="space-y-1 text-sm leading-5 text-text-tertiary">
          {card.notes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {card.source && (
        <a
          href={card.source}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
        >
          Source
        </a>
      )}
    </Dialog>
  )
}

export default function GuidePage() {
  const [selected, setSelected] = useState<GuideCard | null>(null)
  const { data } = useQuery({
    queryKey: ['guide-available-models'],
    queryFn: () => apiClient<AvailableModelsResponse>('/me/available-models'),
    staleTime: 15_000,
  })
  const models = data?.models ?? []
  const chatModel = models.find((model) => model.type === 'chat')?.name ?? 'gpt-5.5'

  const cards = useMemo<GuideCard[]>(() => [
    {
      id: 'opencode',
      title: 'OpenCode',
      image: '/provider-logos/opencode.png',
      surface: 'TUI / CLI',
      tested: [
        'Installed: opencode 1.17.10.',
        'opencode providers list works and currently reports 0 credentials.',
        'opencode run supports --model provider/model.',
      ],
      commands: [
        'opencode providers login http://127.0.0.1:8080/v1',
        'opencode providers list',
        `opencode run -m zanellm/${chatModel} "Reply exactly: ok"`,
      ],
      notes: [
        'Use provider id zanellm and the exact model id from API & Accounts.',
        'If provider login does not create the custom provider entry, add it to opencode.json with baseURL http://127.0.0.1:8080/v1.',
      ],
      source: 'https://opencode.ai/docs/providers/',
    },
    {
      id: 'hermes',
      title: 'Hermes Agent',
      image: '/provider-logos/hermes.png',
      surface: 'CLI / TUI',
      tested: [
        'Installed: Hermes Agent v0.17.0.',
        'hermes status works and reports no API keys configured.',
        'Hermes help exposes Custom OpenAI-compatible endpoint via model setup/config.',
      ],
      commands: [
        'hermes config set model.provider custom',
        'hermes config set model.base_url http://127.0.0.1:8080/v1',
        `hermes config set model.default ${chatModel}`,
        'printf "Local key: " && read -rs ZANELLM_API_KEY && export ZANELLM_API_KEY && printf "\\n"',
        'hermes config set OPENAI_API_KEY "$ZANELLM_API_KEY"',
        'hermes -z "Reply exactly: ok"',
      ],
      notes: [
        'Hermes stores API keys in ~/.hermes/.env and model config in ~/.hermes/config.yaml.',
        'Hermes docs state base_url makes it call that endpoint directly using api_key or OPENAI_API_KEY.',
      ],
      source: 'https://hermes-agent.nousresearch.com/docs/user-guide/configuration',
    },
    {
      id: 'claude-code',
      title: 'Claude Code',
      image: '/provider-logos/claude.png',
      surface: 'TUI / CLI',
      tested: [
        'Installed: Claude Code 2.1.191.',
        'claude auth status works and reports loggedIn false.',
        'Installed help shows Anthropic auth/model flow.',
      ],
      commands: [
        'claude auth status',
        'claude --model claude-fable-5 -p "Reply exactly: ok"',
      ],
      notes: [
        'Claude Code expects Anthropic-compatible API behavior.',
        'For direct ZaneLLM routing, add an Anthropic-compatible /v1/messages gateway endpoint or Claude-Code-specific adapter.',
      ],
    },
    {
      id: 'codex',
      title: 'Codex CLI',
      image: '/provider-logos/codex.png',
      surface: 'CLI / TUI',
      tested: [
        'Installed: codex is on PATH.',
        'codex --help and codex exec --help work.',
        'Use ZaneLLM through clients that expose an OpenAI-compatible base URL setting.',
      ],
      commands: [
        'codex --help',
        'codex exec --help',
      ],
      notes: [
        'Codex is listed as working for local guide coverage.',
        'Direct routing through ZaneLLM depends on the Codex surface exposing a base-url/provider setting.',
      ],
    },
  ], [chatModel])

  return (
    <div className="mx-auto max-w-[1280px] pb-10 pt-10">
      <PageHeader
        title="Guide"
        description="Client setup for GUIs, TUIs, and CLIs that can route through ZaneLLM."
      />

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <GuideTile key={card.id} card={card} onOpen={() => setSelected(card)} />
        ))}
      </div>

      {selected && <GuideDialog card={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
