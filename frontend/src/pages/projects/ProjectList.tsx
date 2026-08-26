import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchJson } from '../../lib/api'
import ProjectItem, { type ProjectListItem } from './ProjectItem'
import './Projects.css'

type ProjectApiRow = {
  id: number
  title: string
  location_label_en: string | null
  image_url: string | null
  icon_url: string | null
}

function toListItem(row: ProjectApiRow): ProjectListItem {
  return {
    id: row.id,
    title: row.title,
    locationLabel: row.location_label_en?.trim() ?? '',
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

type ProjectListProps = {
  heading?: string
}

export default function ProjectList({ heading = 'Projects' }: ProjectListProps) {
  const [searchParams] = useSearchParams()
  const typeCode = parsePositiveInt(searchParams.get('type'))
  const typologyId = parsePositiveInt(searchParams.get('typology'))
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const params = new URLSearchParams()
        if (typeCode != null) params.set('type', String(typeCode))
        if (typologyId != null) params.set('typology', String(typologyId))
        const query = params.toString()
        const path = query ? `/api/projects?${query}` : '/api/projects'
        const rows = await fetchJson<ProjectApiRow[]>(path)
        if (cancelled) return
        setError(null)
        setProjects(rows.map(toListItem))
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load projects')
        setProjects([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [typeCode, typologyId])

  if (loading) {
    return (
      <section className="projectListPage">
        <h1 className="projectListHeading">{heading}</h1>
        <p className="projectListStatus">Loading…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="projectListPage">
        <h1 className="projectListHeading">{heading}</h1>
        <p className="projectListError" role="alert">
          {error}
        </p>
      </section>
    )
  }

  if (projects.length === 0) {
    return (
      <section className="projectListPage">
        <h1 className="projectListHeading">{heading}</h1>
        <p className="projectListStatus">
          {typeCode == null && typologyId == null
            ? 'No published projects yet.'
            : 'No projects in this category.'}
        </p>
      </section>
    )
  }

  return (
    <section className="projectListPage">
      <h1 className="projectListHeading">{heading}</h1>
      <div className="projectList">
        {projects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}
