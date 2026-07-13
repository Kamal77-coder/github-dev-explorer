# GitHub Dev Explorer

> Search any GitHub developer and explore their profile, language breakdown,
> and top repositories — pulled **live from the GitHub REST API**.

A front-end app that integrates a **real-world REST API** (no backend, no API
key required). Deploys as a single static site.

**Stack:** React + TypeScript + Vite + Tailwind CSS v4 + `lucide-react`.

## Features

- **Type-ahead search** — debounced, aborts stale requests, dropdown of matches
  (GitHub `/search/users`)
- **Profile card** — avatar, bio, followers/following/repos, company, location,
  blog, Twitter
- **Language breakdown** — aggregated from the user's public repos, shown as a
  proportional bar with GitHub's language colors
- **Repository list** — sort by stars or last-updated, filter by language, with
  stars/forks/topics and relative "updated" timestamps
- **Real API states handled**: loading skeletons, `404` not-found,
  `403` rate-limit (shows when the limit resets), and generic errors
- **Deep links** — `?u=<username>` loads a profile directly (shareable)

## API integration notes

- Base: `https://api.github.com` with the `2022-11-28` API version header.
- **Unauthenticated**, so it's subject to GitHub's public rate limits
  (~60 req/hr for core, ~10/min for search per IP). The UI degrades gracefully
  and tells the user when the limit resets.
- GitHub can't sort repos by stars server-side, so repos are fetched (up to
  100) and sorted client-side; forks are filtered out of the language stats.
- A production version would proxy requests through a small backend that adds a
  token (lifting rate limits and keeping the token secret) — the client code is
  already structured around a single `request()` helper to make that swap easy.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # strict type-check + production build into dist/
npm run preview
```

## Deploy (shareable link)

- **Vercel:** import the repo (preset "Vite"), or `npm i -g vercel && vercel`.
- **Netlify:** build `npm run build`, publish `dist`.

See [CONTEXT.md](./CONTEXT.md) for the background behind this project.
