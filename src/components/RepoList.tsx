import { useMemo, useState } from 'react'
import { GitFork, Star } from 'lucide-react'
import type { GitHubRepo } from '../data/types'
import { languageColor } from './LanguageBar'

type Sort = 'stars' | 'updated'

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  const days = Math.floor((Date.now() - then) / 86_400_000)
  if (days < 1) return 'today'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function RepoCard({ repo }: { repo: GitHubRepo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-xl border border-[#30363d] bg-[#161b22] p-4 transition-colors hover:border-[#58a6ff]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="truncate font-semibold text-[#58a6ff]">{repo.name}</h3>
        {repo.archived && (
          <span className="shrink-0 rounded-full border border-amber-500/40 px-2 py-0.5 text-[10px] text-amber-300">
            archived
          </span>
        )}
      </div>
      {repo.description && (
        <p className="mt-1.5 line-clamp-2 text-sm text-neutral-400">
          {repo.description}
        </p>
      )}
      {repo.topics?.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full bg-[#1f6feb]/15 px-2 py-0.5 text-[11px] text-[#58a6ff]"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: languageColor(repo.language) }}
            />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star size={13} /> {repo.stargazers_count.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <GitFork size={13} /> {repo.forks_count.toLocaleString()}
        </span>
        <span>Updated {timeAgo(repo.updated_at)}</span>
      </div>
    </a>
  )
}

export function RepoList({ repos }: { repos: GitHubRepo[] }) {
  const [sort, setSort] = useState<Sort>('stars')
  const [lang, setLang] = useState<string>('all')

  const languages = useMemo(() => {
    const set = new Set<string>()
    repos.forEach((r) => r.language && set.add(r.language))
    return [...set].sort()
  }, [repos])

  const visible = useMemo(() => {
    let list = repos
    if (lang !== 'all') list = list.filter((r) => r.language === lang)
    return [...list].sort((a, b) =>
      sort === 'stars'
        ? b.stargazers_count - a.stargazers_count
        : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
  }, [repos, sort, lang])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-neutral-300">
          Repositories{' '}
          <span className="text-neutral-600">({visible.length})</span>
        </h2>
        <div className="flex gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-lg border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs text-neutral-300 outline-none focus:border-[#58a6ff]"
          >
            <option value="all">All languages</option>
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <div className="flex overflow-hidden rounded-lg border border-[#30363d]">
            {(['stars', 'updated'] as Sort[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3 py-1.5 text-xs capitalize transition-colors ${
                  sort === s
                    ? 'bg-[#1f6feb] text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#30363d] py-10 text-center text-sm text-neutral-500">
          No public repositories to show.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {visible.map((r) => (
            <RepoCard key={r.id} repo={r} />
          ))}
        </div>
      )}
    </div>
  )
}
