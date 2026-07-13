# Project context

## Why this exists

Portfolio project built to apply for a **Writesonic** role (SDE-2, Full Stack).
HR asked for **one working, shareable project link**. This iteration was
specifically requested to **integrate a real-world API** (an earlier UI-only
demo used mock data).

## What it demonstrates for the role

The Writesonic JD explicitly lists **"Experience integrating RESTful APIs"**,
**TypeScript + React**, responsive/pixel-perfect UI, and great UX. This project
targets all of those directly:

- **Real REST integration** against the public GitHub API — search, user, and
  repos endpoints, with correct headers and versioning.
- **Robust async UX** — debounced type-ahead with request cancellation
  (`AbortController`), parallel fetches (`Promise.all`), loading skeletons, and
  explicit handling of the states real APIs actually produce: `404`,
  `403` rate-limit (with reset time), and network errors.
- **Clean TypeScript** — typed API responses, typed error classes
  (`RateLimitError`, `NotFoundError`), strict compiler flags.
- **Product polish** — GitHub-authentic dark theme, language-colored stats,
  deep-linkable profiles (`?u=`).

## Deliberate decisions (interview talking points)

- **No API key / no backend**, by request — kept as a static site so it's one
  shareable link. The trade-off is GitHub's unauthenticated rate limits, which
  the UI surfaces gracefully rather than failing silently.
- **All API access flows through one `request()` helper** — so adding an auth
  token or a backend proxy later is a one-line change, not a refactor. Worth
  calling out as forward-thinking design.
- **Repos sorted client-side** because the GitHub API can't sort repos by stars
  server-side; forks are excluded from language stats to reflect real authored
  work.

## Production roadmap

Add a tiny backend (Node/Express or Python/FastAPI) that injects a GitHub token
server-side: lifts rate limits, keeps the token secret, and enables authed-only
data. The frontend contract wouldn't change.

## Tech summary

| Area | Choice |
| --- | --- |
| Language | TypeScript (strict) |
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Data source | GitHub REST API (public, unauthenticated) |
| Hosting | static (Vercel / Netlify) |

See [README.md](./README.md) for run + deploy instructions.
