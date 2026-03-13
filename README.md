# next-typed-i18n

Type-safe, zero-config i18n for **Next.js App Router**. One factory function gives you everything: locale detection, server/client dictionary loading, middleware, and full TypeScript inference from your JSON files — no code generation, no config files.

## Features

- **Zero-config loading** — drop JSON files in `/dictionary`, no loader setup required
- **Full type safety** — `Dictionary` type is inferred directly from your JSON files when using custom loaders
- **No prop drilling** — `getLocale()` and `getDictionary()` work anywhere in Server Components
- **Client hook** — `useDictionary()` uses React `use()` + promise caching, never re-fetches
- **Middleware included** — locale detection and redirect in one line
- **Zero dependencies** — only `next` and `react` as peers

## Installation

```bash
npm install next-typed-i18n
# or
pnpm add next-typed-i18n
```

## Quick Start

### 1. Create your dictionaries

By default the library looks for `[locale].json` files in `/dictionary` (or `/src/dictionary`):

```
dictionary/
  en.json
  uk.json
```

```json
// dictionary/en.json
{
  "header": { "nav": { "home": "Home", "about": "About" } },
  "hero": { "title": "Welcome", "cta": "Get Started" }
}
```

### 2. Create your i18n instance

**Zero-config** — no loaders needed, files are loaded automatically from the `dictionary` folder:

```ts
// lib/i18n.ts
import { createI18n } from 'next-typed-i18n'

export const {
  setLocale,
  getLocale,
  getDictionary,
  useDictionary,
  middleware,
  middlewareConfig,
  getStaticParams,
  locales,
  defaultLocale,
} = createI18n({
  locales: ['en', 'uk'] as const,
  defaultLocale: 'en',
})
```

**With custom loaders** — get full TypeScript inference from your JSON shapes:

```ts
// lib/i18n.ts
import { createI18n } from 'next-typed-i18n'

export const { getDictionary, useDictionary, ...rest } = createI18n({
  locales: ['en', 'uk'] as const,
  defaultLocale: 'en',
  loaders: {
    en: () => import('../dictionary/en.json').then((m) => m.default),
    uk: () => import('../dictionary/uk.json').then((m) => m.default),
  },
})

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>
```

### 3. Add middleware

```ts
// middleware.ts
export { middleware, middlewareConfig as config } from '@/lib/i18n'
```

### 4. Set locale in the root layout

```tsx
// app/[lang]/layout.tsx
import { setLocale, getStaticParams } from '@/lib/i18n'
import type { Locale } from 'next-typed-i18n'

export function generateStaticParams() {
  return getStaticParams() // [{ lang: 'en' }, { lang: 'uk' }]
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  setLocale(lang)

  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  )
}
```

### 5. Use in Server Components

```tsx
// app/[lang]/page.tsx
import { getDictionary } from '@/lib/i18n'

export default async function HomePage() {
  const dict = await getDictionary() // locale auto-detected from setLocale()

  return <h1>{dict.hero.title}</h1>
}
```

Pass locale explicitly when needed (e.g. inside `generateStaticParams`):

```tsx
const dict = await getDictionary('en')
```

### 6. Use in Client Components

```tsx
'use client'
import { useDictionary } from '@/lib/i18n'

export function Header() {
  const dict = useDictionary() // reads locale from pathname, suspends until ready

  return <nav>{dict.header.nav.home}</nav>
}
```

Wrap with `<Suspense>` somewhere above in the tree:

```tsx
<Suspense fallback={<HeaderSkeleton />}>
  <Header />
</Suspense>
```

## API Reference

### `createI18n(config)`

| Option           | Type                               | Default                              | Description                                         |
| ---------------- | ---------------------------------- | ------------------------------------ | --------------------------------------------------- |
| `locales`        | `readonly string[]`                | —                                    | All supported locale strings. Use `as const`.       |
| `defaultLocale`  | `string`                           | —                                    | Fallback locale for redirects and build time.       |
| `loaders`        | `Record<locale, () => Promise<T>>` | auto-discovered from `dictionaryPath`| Async functions that return the dictionary.         |
| `dictionaryPath` | `string`                           | `"dictionary"` or `"src/dictionary"` | Path to JSON files. Absolute or relative to `cwd`. |
| `debug`          | `boolean`                          | `false`                              | Log warnings and info to the console.               |

Returns an object with:

| Export                        | Where      | Description                                                       |
| ----------------------------- | ---------- | ----------------------------------------------------------------- |
| `setLocale(lang)`             | Server     | Set request locale. Call in layout before anything else.          |
| `getLocale()`                 | Server     | Get request locale. Cached with React `cache()`.                  |
| `getDictionary(lang?)`        | Server     | Load dictionary. Auto-detects locale when `lang` is omitted.      |
| `useDictionary()`             | Client     | Hook: reads locale from pathname, returns typed dictionary.       |
| `middleware(req)`             | Middleware | Redirects requests missing a locale prefix to the default.        |
| `middlewareConfig`            | Middleware | The `config` export with the recommended matcher pattern.         |
| `getStaticParams(paramName?)` | Server     | Returns `[{ lang: 'en' }, ...]` for `generateStaticParams`.      |
| `locales`                     | Both       | The configured locale array.                                      |
| `defaultLocale`               | Both       | The configured default locale string.                             |

## How it works

**Auto-loading:** When no `loaders` are provided, the library looks for `[locale].json` files in `{cwd}/dictionary/`, then `{cwd}/src/dictionary/`. Files are read via `fs` on the server at request time. Use `dictionaryPath` to point to a custom folder.

**Server side:** `setLocale()` writes to a module-level variable. Next.js creates a new module scope per request (with the Node.js runtime), so this is request-isolated. `getLocale()` is wrapped in React's `cache()` to ensure the value is stable within one render pass and can be read from any Server Component without prop drilling.

**Client side:** `useDictionary()` extracts the locale from the current pathname via `usePathname()`, then fetches the dictionary via the configured loader. The resulting `Promise` is stored in a `Map` so subsequent renders return the same stable promise. React's `use()` hook suspends the component until the promise resolves.

**Middleware:** Checks whether the incoming pathname already has a locale segment. If not, prepends the default locale and returns a 308 permanent redirect.
