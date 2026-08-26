import { useEffect, useRef, useState, type TransitionEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchJson } from '../../lib/api'
import ProjectItem, { type ProjectListItem } from './ProjectItem'
import './Projects.css'

type ProjectApiRow = {
  id: number
  title: string
  location_name_en: string | null
  state_name_en: string | null
  image_url: string | null
  icon_url: string | null
}

type ListView = {
  projects: ProjectListItem[]
  status: string | null
}

type SwapStage = 'idle' | 'exiting' | 'awaiting' | 'enterFrom' | 'entering'

function formatLocationLabel(row: ProjectApiRow): string {
  return [row.location_name_en, row.state_name_en]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(', ')
}

function toListItem(row: ProjectApiRow): ProjectListItem {
  return {
    id: row.id,
    title: row.title,
    locationLabel: formatLocationLabel(row),
    imageUrl: row.image_url,
    iconUrl: row.icon_url,
  }
}

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null
  const parsed = Number.parseInt(value, 10)
  if (!Number.isInteger(parsed) || parsed <= 0) return null
  return parsed
}

function emptyStatus(typeCode: number | null, typologyId: number | null): string {
  return typeCode == null && typologyId == null
    ? 'No published projects yet.'
    : 'No projects in this category.'
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type ProjectListProps = {
  heading?: string
}

export default function ProjectList({ heading = 'Projects' }: ProjectListProps) {
  const [searchParams] = useSearchParams()
  const typeCode = parsePositiveInt(searchParams.get('type'))
  const typologyId = parsePositiveInt(searchParams.get('typology'))
  const [view, setView] = useState<ListView>({ projects: [], status: null })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [stage, setStage] = useState<SwapStage>('idle')
  const pendingRef = useRef<ListView | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasLoadedOnce = useRef(false)
  const requestId = useRef(0)
  const stageRef = useRef<SwapStage>('idle')

  function setSwapStage(next: SwapStage) {
    stageRef.current = next
    setStage(next)
  }

  useEffect(() => {
    const id = ++requestId.current
    let cancelled = false
    const animate = hasLoadedOnce.current && !prefersReducedMotion()

    if (animate) {
      pendingRef.current = null
      // eslint-disable-next-line react-hooks/set-state-in-effect -- start slide-up as soon as the filter changes
      if (stageRef.current !== 'exiting') setSwapStage('exiting')
    }

    async function load() {
      try {
        const params = new URLSearchParams()
        if (typeCode != null) params.set('type', String(typeCode))
        if (typologyId != null) params.set('typology', String(typologyId))
        const query = params.toString()
        const path = query ? `/api/projects?${query}` : '/api/projects'
        const rows = await fetchJson<ProjectApiRow[]>(path)
        if (cancelled || id !== requestId.current) return

        const next: ListView = {
          projects: rows.map(toListItem),
          status: rows.length === 0 ? emptyStatus(typeCode, typologyId) : null,
        }
        setError(null)

        if (!hasLoadedOnce.current) {
          hasLoadedOnce.current = true
          setView(next)
          setLoading(false)
          return
        }

        if (!animate) {
          setView(next)
          setSwapStage('idle')
          return
        }

        pendingRef.current = next
        tryEnter()
      } catch (err) {
        if (cancelled || id !== requestId.current) return
        hasLoadedOnce.current = true
        setError(err instanceof Error ? err.message : 'Failed to load projects')
        setView({ projects: [], status: null })
        setSwapStage('idle')
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [typeCode, typologyId])

  useEffect(() => {
    if (stage !== 'enterFrom') return
    let cancelled = false
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setSwapStage('entering')
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(id)
    }
  }, [stage])

  useEffect(() => {
    if (stage !== 'exiting' && stage !== 'entering') return
    const t = window.setTimeout(() => {
      if (stage === 'exiting') finishExit()
      if (stage === 'entering') finishEnter()
    }, 450)
    return () => window.clearTimeout(t)
  }, [stage])

  function tryEnter() {
    if (!pendingRef.current) return
    if (stageRef.current === 'exiting') return
    window.scrollTo(0, 0)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    setView(pendingRef.current)
    pendingRef.current = null
    setSwapStage('enterFrom')
  }

  function finishExit() {
    if (stageRef.current !== 'exiting') return
    stageRef.current = 'awaiting'
    setSwapStage('awaiting')
    tryEnter()
  }

  function finishEnter() {
    if (stageRef.current !== 'entering') return
    setSwapStage('idle')
  }

  function onStageTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return
    if (event.propertyName !== 'transform') return
    if (stage === 'exiting') finishExit()
    if (stage === 'entering') finishEnter()
  }

  const stageClass =
    stage === 'idle' ? '' : ` projectPageSwap__stage--${stage}`

  function renderBody() {
    if (loading) {
      return <p className="projectListStatus">Loading…</p>
    }
    if (error) {
      return (
        <p className="projectListError" role="alert">
          {error}
        </p>
      )
    }
    if (view.projects.length === 0) {
      return <p className="projectListStatus">{view.status}</p>
    }
    return (
      <div className="projectList">
        {view.projects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </div>
    )
  }

  return (
    <section className="projectListPage">
      <h1 className="projectListHeading">{heading}</h1>
      <div className="projectPageSwap">
        <div
          className={`projectPageSwap__stage${stageClass}`}
          onTransitionEnd={onStageTransitionEnd}
        >
          <div className="projectPageSwap__scroll" ref={scrollRef}>
            {renderBody()}
          </div>
        </div>
      </div>
    </section>
  )
}
