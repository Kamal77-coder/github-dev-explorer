import { useState } from 'react'
import {
  Building2,
  Check,
  ExternalLink,
  Link2,
  LinkIcon,
  MapPin,
  Users,
} from 'lucide-react'
import type { GitHubUser } from '../data/types'

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-semibold text-white">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  )
}

function normalizeUrl(url: string) {
  return url.startsWith('http') ? url : `https://${url}`
}

export function ProfileCard({ user }: { user: GitHubUser }) {
  const [copied, setCopied] = useState(false)

  const shareLink = async () => {
    const url = `${window.location.origin}/?u=${user.login}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked (e.g. insecure context) — no-op
    }
  }

  return (
    <div className="animate-fade-in rounded-2xl border border-[#30363d] bg-[#161b22] p-6">
      <div className="flex flex-col items-center text-center">
        <img
          src={user.avatar_url}
          alt={user.login}
          className="h-24 w-24 rounded-full ring-2 ring-[#30363d]"
        />
        <h2 className="mt-4 text-xl font-semibold text-white">
          {user.name ?? user.login}
        </h2>
        <a
          href={user.html_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-sm text-[#58a6ff] hover:underline"
        >
          @{user.login}
          <ExternalLink size={12} />
        </a>
        {user.bio && (
          <p className="mt-3 text-sm leading-relaxed text-neutral-300">
            {user.bio}
          </p>
        )}
        <button
          onClick={shareLink}
          className="mt-4 flex items-center gap-1.5 rounded-lg border border-[#30363d] px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-[#58a6ff] hover:text-white"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              Link copied
            </>
          ) : (
            <>
              <Link2 size={13} />
              Copy share link
            </>
          )}
        </button>
      </div>

      <div className="my-5 flex items-center justify-around border-y border-[#30363d] py-4">
        <Stat value={user.followers} label="followers" />
        <Stat value={user.following} label="following" />
        <Stat value={user.public_repos} label="repos" />
      </div>

      <div className="space-y-2 text-sm text-neutral-400">
        {user.company && (
          <div className="flex items-center gap-2">
            <Building2 size={15} className="shrink-0 text-neutral-600" />
            {user.company}
          </div>
        )}
        {user.location && (
          <div className="flex items-center gap-2">
            <MapPin size={15} className="shrink-0 text-neutral-600" />
            {user.location}
          </div>
        )}
        {user.blog && (
          <div className="flex items-center gap-2">
            <LinkIcon size={15} className="shrink-0 text-neutral-600" />
            <a
              href={normalizeUrl(user.blog)}
              target="_blank"
              rel="noreferrer"
              className="truncate text-[#58a6ff] hover:underline"
            >
              {user.blog}
            </a>
          </div>
        )}
        {user.twitter_username && (
          <div className="flex items-center gap-2">
            <Users size={15} className="shrink-0 text-neutral-600" />
            <a
              href={`https://twitter.com/${user.twitter_username}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#58a6ff] hover:underline"
            >
              @{user.twitter_username}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
