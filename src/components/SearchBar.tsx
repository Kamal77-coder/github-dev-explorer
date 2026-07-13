import { useEffect, useRef, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { searchUsers } from '../api/github'
import type { UserSearchItem } from '../data/types'

interface Props {
  onSelect: (login: string) => void
}

export function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<UserSearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  // debounced type-ahead search
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setItems([])
      return
    }
    const controller = new AbortController()
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await searchUsers(q, controller.signal)
        setItems(res.items)
        setOpen(true)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setItems([])
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => {
      controller.abort()
      clearTimeout(t)
    }
  }, [query])

  // close dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function choose(login: string) {
    setQuery(login)
    setOpen(false)
    onSelect(login)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) choose(query.trim())
  }

  return (
    <div ref={boxRef} className="relative">
      <form onSubmit={submit}>
        <Search
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => items.length && setOpen(true)}
          placeholder="Search a GitHub username… (e.g. torvalds, gaearon)"
          className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] py-3 pl-11 pr-11 text-sm text-white outline-none transition-colors focus:border-[#58a6ff]"
          autoComplete="off"
          spellCheck={false}
        />
        {loading && (
          <Loader2
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-neutral-500"
          />
        )}
      </form>

      {open && items.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl">
          {items.map((u) => (
            <li key={u.id}>
              <button
                onClick={() => choose(u.login)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#1f242c]"
              >
                <img
                  src={u.avatar_url}
                  alt=""
                  className="h-7 w-7 rounded-full"
                  loading="lazy"
                />
                <span className="text-neutral-200">{u.login}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
