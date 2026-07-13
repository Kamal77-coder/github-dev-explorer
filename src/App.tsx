import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Clock, Github, SearchX } from 'lucide-react'
import { getUser, getUserRepos, languageBreakdown } from './api/github'
import {
  NotFoundError,
  RateLimitError,
  type GitHubRepo,
  type GitHubUser,
} from './data/types'
import { SearchBar } from './components/SearchBar'
import { ProfileCard } from './components/ProfileCard'
import { RepoList } from './components/RepoList'
import { LanguageBar } from './components/LanguageBar'

type Status = 'idle' | 'loading' | 'ready' | 'error'

interface ErrorState {
  kind: 'rate-limit' | 'not-found' | 'generic'
  message: string
  resetAt?: Date | null
}

const SUGGESTED = ['torvalds', 'gaearon', 'yyx990803', 'sindresorhus', 'tj']

export default function App() {
  const [status, setStatus] = useState<Status>('idle')
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [error, setError] = useState<ErrorState | null>(null)

  const load = useCallback(async (login: string, push = true) => {
    setStatus('loading')
    setError(null)
    try {
      const [u, r] = await Promise.all([getUser(login), getUserRepos(login)])
      setUser(u)
      setRepos(r)
      setStatus('ready')
      // reflect the current profile in the URL so it's shareable
      const url = new URL(window.location.href)
      url.searchParams.set('u', u.login)
      window.history[push ? 'pushState' : 'replaceState']({ u: u.login }, '', url)
    } catch (err) {
      if (err instanceof RateLimitError) {
        setError({
          kind: 'rate-limit',
          message:
            'GitHub limits unauthenticated requests. Please try again shortly.',
          resetAt: err.resetAt,
        })
      } else if (err instanceof NotFoundError) {
        setError({
          kind: 'not-found',
          message: `No GitHub user found for "${login}".`,
        })
      } else {
        setError({
          kind: 'generic',
          message: (err as Error).message || 'Something went wrong.',
        })
      }
      setStatus('error')
    }
  }, [])

  // deep-link support: ?u=login (initial load + back/forward navigation)
  useEffect(() => {
    const u = new URLSearchParams(window.location.search).get('u')
    if (u) load(u, false)

    const onPop = () => {
      const login = new URLSearchParams(window.location.search).get('u')
      if (login) load(login, false)
      else {
        setStatus('idle')
        setUser(null)
        setRepos([])
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [load])

  const langs = status === 'ready' ? languageBreakdown(repos) : []

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center gap-2.5">
        <Github size={22} className="text-white" />
        <span className="font-semibold text-white">GitHub Dev Explorer</span>
        <span className="ml-auto hidden text-xs text-neutral-600 sm:block">
          Live data · GitHub REST API
        </span>
      </header>

      <SearchBar onSelect={load} />

      {/* idle landing */}
      {status === 'idle' && (
        <div className="mt-16 text-center animate-fade-in">
          <Github size={48} className="mx-auto text-[#30363d]" />
          <h1 className="mt-4 text-xl font-semibold text-white">
            Explore any developer on GitHub
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Search a username to see their profile, language breakdown, and
            top repositories — pulled live from the GitHub REST API.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => load(s)}
                className="rounded-full border border-[#30363d] px-3.5 py-1.5 text-sm text-neutral-300 transition-colors hover:border-[#58a6ff] hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* loading skeleton */}
      {status === 'loading' && (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="space-y-3">
            <div className="skeleton h-16 rounded-2xl" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-28 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* error */}
      {status === 'error' && error && (
        <div className="mt-16 flex flex-col items-center text-center animate-fade-in">
          {error.kind === 'rate-limit' ? (
            <Clock size={40} className="text-amber-400" />
          ) : error.kind === 'not-found' ? (
            <SearchX size={40} className="text-neutral-500" />
          ) : (
            <AlertTriangle size={40} className="text-rose-400" />
          )}
          <p className="mt-4 max-w-md text-sm text-neutral-300">
            {error.message}
          </p>
          {error.kind === 'rate-limit' && error.resetAt && (
            <p className="mt-1 text-xs text-neutral-500">
              Limit resets around{' '}
              {error.resetAt.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              .
            </p>
          )}
        </div>
      )}

      {/* results */}
      {status === 'ready' && user && (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <ProfileCard user={user} />
            <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5">
              <h2 className="mb-3 text-sm font-semibold text-neutral-300">
                Top languages
              </h2>
              <LanguageBar data={langs} />
            </div>
          </aside>
          <main>
            <RepoList repos={repos} />
          </main>
        </div>
      )}

      <footer className="mt-12 text-center text-xs text-neutral-600">
        <p>
          Built with React + TypeScript + Vite · data from the public GitHub
          REST API (unauthenticated)
        </p>
        <p className="mt-1.5">
          Made by{' '}
          <a
            href="https://github.com/Kamal77-coder"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-neutral-400 transition-colors hover:text-[#58a6ff]"
          >
            Kamal Rohilla
          </a>
        </p>
      </footer>
    </div>
  )
}
