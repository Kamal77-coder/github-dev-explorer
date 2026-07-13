export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
  name: string | null
  company: string | null
  blog: string | null
  location: string | null
  bio: string | null
  twitter_username: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  topics: string[]
  fork: boolean
  archived: boolean
  updated_at: string
}

export interface UserSearchItem {
  login: string
  id: number
  avatar_url: string
  html_url: string
}

/** Raised for a rate-limit (HTTP 403 with remaining=0) so the UI can react. */
export class RateLimitError extends Error {
  resetAt: Date | null
  constructor(resetAt: Date | null) {
    super('GitHub API rate limit exceeded')
    this.name = 'RateLimitError'
    this.resetAt = resetAt
  }
}

export class NotFoundError extends Error {
  constructor(what: string) {
    super(`${what} not found`)
    this.name = 'NotFoundError'
  }
}
