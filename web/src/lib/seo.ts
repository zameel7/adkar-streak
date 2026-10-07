import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://adkar.zameel7.me'

const DEFAULT_TITLE = 'Adkar Champ — Daily Islamic Remembrance'
const DEFAULT_DESCRIPTION =
  'Adkar Champ — daily morning and evening Islamic remembrance, with streak tracking. Read adkar from Hisnul Muslim, in Arabic with English translation.'

type PageMeta = { title: string; description: string; noindex?: boolean }

const PAGE_META: Record<string, PageMeta> = {
  '/': { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  '/morning': {
    title: 'Morning Adkar (Adhkar as-Sabah) — Adkar Champ',
    description:
      'Read the morning adkar from Hisnul Muslim in Arabic with English translation and repetition counts.',
  },
  '/evening': {
    title: 'Evening Adkar (Adhkar al-Masa) — Adkar Champ',
    description:
      'Read the evening adkar from Hisnul Muslim in Arabic with English translation and repetition counts.',
  },
  '/privacy': {
    title: 'Privacy Policy — Adkar Champ',
    description: 'How Adkar Champ handles your data.',
  },
  '/delete-account': {
    title: 'Delete Account — Adkar Champ',
    description: 'Request deletion of your Adkar Champ account and data.',
    noindex: true,
  },
}

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

/** Keeps title, description, canonical and robots in sync with the current route. */
export function useRouteMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = PAGE_META[pathname] ?? { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, noindex: true }
    const url = `${SITE_URL}${pathname === '/' ? '/' : pathname}`

    document.title = meta.title
    setMeta('meta[name="description"]', 'content', meta.description)
    setMeta('meta[property="og:title"]', 'content', meta.title)
    setMeta('meta[property="og:description"]', 'content', meta.description)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('meta[name="twitter:title"]', 'content', meta.title)
    setMeta('meta[name="twitter:description"]', 'content', meta.description)
    setMeta('link[rel="canonical"]', 'href', url)
    setMeta('meta[name="robots"]', 'content', meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
  }, [pathname])
}
