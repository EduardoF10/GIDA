import { useEffect, useState } from 'react'
import {
  hasSupabaseConfig,
  supabase,
  supabaseCatalog,
  supabaseEntity,
} from '../../lib/supabaseClient'
import ProjectItem, { type ProjectListItem } from './ProjectItem'
import './Projects.css'

type ProjectCardRow = {
  id: number
  title: string
  location_id: number
  image_path: string | null
}

type CountryEmbed = { name_en: string }
type StateEmbed = { name_en: string; countries: CountryEmbed | CountryEmbed[] | null }
type LocationRow = {
  id: number
  name_en: string
  states: StateEmbed | StateEmbed[] | null
}

function first<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function formatLocation(row: LocationRow | undefined): string {
  if (!row) return ''
  const state = first(row.states)
  const country = first(state?.countries)
  const city = row.name_en?.trim() ?? ''
  const countryName = country?.name_en?.trim() ?? ''
  return [city, countryName].filter(Boolean).join(', ')
}

function projectImageUrl(path: string | null): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return supabase.storage.from('project-media').getPublicUrl(path).data.publicUrl
}

type ProjectListProps = {
  heading?: string
}

export default function ProjectList({ heading = 'Projects' }: ProjectListProps) {
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(() => hasSupabaseConfig)

  useEffect(() => {
    if (!hasSupabaseConfig) {
      return
    }
    let cancelled = false

    async function load() {
      const { data: projectRows, error: projectErr } = await supabaseEntity()
        .from('projects')
        .select('id, title, location_id, image_path')
        .eq('is_hidden', false)
        .order('final_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (cancelled) return
      if (projectErr) {
        setError(projectErr.message)
        setProjects([])
        setLoading(false)
        return
      }

      const rows = (projectRows ?? []) as ProjectCardRow[]
      const locationIds = [...new Set(rows.map((p) => p.location_id).filter(Boolean))]

      let locationById = new Map<number, LocationRow>()
      if (locationIds.length > 0) {
        const { data: locationRows, error: locationErr } = await supabaseCatalog()
          .from('locations')
          .select('id, name_en, states ( name_en, countries ( name_en ) )')
          .in('id', locationIds)

        if (cancelled) return
        if (locationErr) {
          setError(locationErr.message)
          setProjects([])
          setLoading(false)
          return
        }

        locationById = new Map(((locationRows ?? []) as LocationRow[]).map((loc) => [loc.id, loc]))
      }

      setError(null)
      setProjects(
        rows.map((p) => ({
          id: p.id,
          title: p.title,
          locationLabel: formatLocation(locationById.get(p.location_id)),
          imageUrl: projectImageUrl(p.image_path),
        })),
      )
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (!hasSupabaseConfig) {
    return (
      <section className="projectListPage">
        <h1 className="projectListHeading">{heading}</h1>
        <p className="projectListStatus">
          Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to load
          projects.
        </p>
      </section>
    )
  }

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
        <p className="projectListStatus">No published projects yet.</p>
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
