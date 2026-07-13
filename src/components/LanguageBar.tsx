const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  Elixir: '#6e4a7e',
  Scala: '#c22d40',
}

function colorFor(lang: string) {
  return LANG_COLORS[lang] ?? '#8b949e'
}

export function LanguageBar({ data }: { data: [string, number][] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        No language data across public repos.
      </p>
    )
  }

  const total = data.reduce((n, [, c]) => n + c, 0)
  const top = data.slice(0, 8)

  return (
    <div>
      <div className="mb-3 flex h-2.5 w-full overflow-hidden rounded-full bg-[#161b22]">
        {top.map(([lang, count]) => (
          <div
            key={lang}
            style={{
              width: `${(count / total) * 100}%`,
              backgroundColor: colorFor(lang),
            }}
            title={`${lang}: ${count} repos`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {top.map(([lang, count]) => (
          <span
            key={lang}
            className="flex items-center gap-1.5 text-xs text-neutral-400"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colorFor(lang) }}
            />
            {lang}
            <span className="text-neutral-600">
              {Math.round((count / total) * 100)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

export { colorFor as languageColor }
