import {
  NotFoundError,
  RateLimitError,
  type GitHubRepo,
  type GitHubUser,
  type UserSearchItem,
} from '../data/types'

const BASE = 'https://api.github.com'

const HEADERS: HeadersInit = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS, signal })

  if (res.status === 404) {
    throw new NotFoundError('That')
  }

  if (res.status === 403 || res.status === 429) {
    const remaining = res.headers.get('x-ratelimit-remaining')
    if (remaining === '0' || res.status === 429) {
      const reset = res.headers.get('x-ratelimit-reset')
      throw new RateLimitError(reset ? new Date(Number(reset) * 1000) : null)
    }
  }

  if (!res.ok) {
    throw new Error(`GitHub API error (${res.status})`)
  }

  return res.json() as Promise<T>
}

export function searchUsers(
  query: string,
  signal?: AbortSignal,
): Promise<{ items: UserSearchItem[]; total_count: number }> {
  const q = encodeURIComponent(query.trim())
  return request(`/search/users?q=${q}&per_page=8`, signal)
}

export function getUser(login: string, signal?: AbortSignal): Promise<GitHubUser> {
  return request(`/users/${encodeURIComponent(login)}`, signal)
}

export async function getUserRepos(
  login: string,
  signal?: AbortSignal,
): Promise<GitHubRepo[]> {
  // GitHub can't sort by stars server-side, so fetch a page and sort locally.
  const repos = await request<GitHubRepo[]>(
    `/users/${encodeURIComponent(login)}/repos?per_page=100&sort=updated`,
    signal,
  )
  return repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
}

/** Aggregate primary languages across repos into sorted [lang, count] pairs. */
export function languageBreakdown(repos: GitHubRepo[]): [string, number][] {
  const counts = new Map<string, number>()
  for (const r of repos) {
    if (!r.language) continue
    counts.set(r.language, (counts.get(r.language) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}
