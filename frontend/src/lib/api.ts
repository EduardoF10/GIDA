import { supabase, supabaseEntity } from './supabaseClient'

export type ProjectListRow = {
  id: number
  title: string
  location_name_en: string | null
  state_name_en: string | null
  image_url: string | null
  icon_url: string | null
}

export type ProjectTypologyRow = {
  id: number
  description_en: string
  description_es: string
}

export type ProjectTypeRow = {
  code: number
  description_en: string
  description_es: string
  typologies: ProjectTypologyRow[]
}

type ProjectViewRow = {
  id: number
  title: string
  location_name_en: string | null
  state_name_en: string | null
  bucket_name: string | null
  path_name: string | null
  icon_bucket_name: string | null
  icon_path_name: string | null
}

function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message)
}

function publicStorageUrl(bucket: string | null, path: string | null): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  if (!bucket) return null
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

function asTypologies(value: unknown): ProjectTypologyRow[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is ProjectTypologyRow => {
    if (!item || typeof item !== 'object') return false
    const row = item as ProjectTypologyRow
    return Number.isInteger(row.id) && typeof row.description_en === 'string'
  })
}

export async function fetchPublishedProjects(filters: {
  typeCode?: number | null
  typologyId?: number | null
} = {}): Promise<ProjectListRow[]> {
  let query = supabaseEntity()
    .from('published_projects_v')
    .select(
      'id, title, location_name_en, state_name_en, bucket_name, path_name, icon_bucket_name, icon_path_name',
    )
    .order('final_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters.typeCode != null) query = query.eq('project_type_code', filters.typeCode)
  if (filters.typologyId != null) query = query.eq('typology_id', filters.typologyId)

  const { data, error } = await query
  throwIfError(error)

  return ((data ?? []) as ProjectViewRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    location_name_en: row.location_name_en,
    state_name_en: row.state_name_en,
    image_url: publicStorageUrl(row.bucket_name, row.path_name),
    icon_url: publicStorageUrl(row.icon_bucket_name, row.icon_path_name),
  }))
}

export async function fetchProjectTypes(): Promise<ProjectTypeRow[]> {
  const { data, error } = await supabaseEntity()
    .from('project_types_v')
    .select('code, description_en, description_es, typologies')
    .order('code', { ascending: true })
  throwIfError(error)

  return ((data ?? []) as Array<Omit<ProjectTypeRow, 'typologies'> & { typologies: unknown }>).map(
    (row) => ({
      code: row.code,
      description_en: row.description_en,
      description_es: row.description_es,
      typologies: asTypologies(row.typologies),
    }),
  )
}
