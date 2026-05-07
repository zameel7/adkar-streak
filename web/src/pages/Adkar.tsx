import { useEffect, useMemo, useState } from 'react'
import morningData from '../data/morning.json'
import eveningData from '../data/evening.json'
import './Adkar.css'

type AdkarEntry = {
  title: string
  adkar: string[]
  translation: string[]
  repeat: string
  repeatCount: number
}

type AdkarSource = Record<string, AdkarEntry>

const SOURCES: Record<'morning' | 'evening', AdkarSource> = {
  morning: morningData as AdkarSource,
  evening: eveningData as AdkarSource,
}

const META: Record<
  'morning' | 'evening',
  { title: string; subtitle: string; eyebrow: string; accent: string; tint: string }
> = {
  morning: {
    title: 'Morning Adkar',
    subtitle: 'The remembrances for the start of the day, from Hisnul Muslim.',
    eyebrow: 'Morning · Sabah',
    accent: '#0ea5e9',
    tint: 'rgba(14, 165, 233, 0.12)',
  },
  evening: {
    title: 'Evening Adkar',
    subtitle: 'The remembrances for the close of the day, from Hisnul Muslim.',
    eyebrow: 'Evening · Masaa',
    accent: '#5b21b6',
    tint: 'rgba(91, 33, 182, 0.14)',
  },
}

const TRANSLATIONS_KEY = 'web.adkar.showTranslations'

interface AdkarProps {
  type: 'morning' | 'evening'
}

export default function Adkar({ type }: AdkarProps) {
  const meta = META[type]
  const data = SOURCES[type]
  const entries = useMemo(
    () => Object.keys(data).sort((a, b) => Number(a) - Number(b)).map((k) => data[k]),
    [data]
  )

  const [showTranslations, setShowTranslations] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(TRANSLATIONS_KEY)
      if (raw === null) return true
      return raw === 'true'
    } catch {
      return true
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(TRANSLATIONS_KEY, String(showTranslations))
    } catch {
      // localStorage unavailable (private mode) — ignore
    }
  }, [showTranslations])

  // Reset scroll on type change.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [type])

  const periodVars = {
    '--period-accent': meta.accent,
    '--period-tint': meta.tint,
  } as React.CSSProperties

  return (
    <div className="adkar-page">
      <header className="adkar-header" style={periodVars}>
        <span className="adkar-eyebrow">
          <span className="adkar-eyebrow-dot" />
          {meta.eyebrow}
        </span>
        <h1 className="adkar-title">{meta.title}</h1>
        <p className="adkar-subtitle">{meta.subtitle}</p>

        <div className="adkar-toolbar">
          <span className="adkar-count">{entries.length} adkar</span>
          <label className="adkar-toggle">
            <input
              type="checkbox"
              checked={showTranslations}
              onChange={(e) => setShowTranslations(e.target.checked)}
            />
            <span className="adkar-toggle-track">
              <span className="adkar-toggle-thumb" />
            </span>
            <span className="adkar-toggle-label">Translations</span>
          </label>
        </div>
      </header>

      <ol className="adkar-list">
        {entries.map((entry, idx) => (
          <li key={idx} className="adkar-item">
            <div className="adkar-item-meta">
              <span className="adkar-item-num">{String(idx + 1).padStart(2, '0')}</span>
              <span className="adkar-item-repeat">Repeat · {entry.repeat}</span>
            </div>
            <h2 className="adkar-item-title">{entry.title}</h2>

            {entry.adkar.map((arabic, i) => {
              const translation = entry.translation[i]
              return (
                <div key={i} className="adkar-block">
                  <p className="adkar-arabic" dir="rtl" lang="ar">
                    {arabic}
                  </p>
                  {showTranslations && translation ? (
                    <p className="adkar-translation">{translation}</p>
                  ) : null}
                </div>
              )
            })}
          </li>
        ))}
      </ol>

      <div className="adkar-footnote">
        <p>
          End of {meta.title.toLowerCase()}. May Allah accept from you and from us.
        </p>
      </div>
    </div>
  )
}
