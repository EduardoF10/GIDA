import { useEffect, useState, type TransitionEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchJson } from '../../lib/api'
import './ProjectTypeFilter.css'

type TypologyRow = {
  id: number
  description_en: string
  description_es: string
}

type ProjectTypeRow = {
  code: number
  description_en: string
  description_es: string
  typologies?: TypologyRow[]
}

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null
  const parsed = Number.parseInt(value, 10)
  if (!Number.isInteger(parsed) || parsed <= 0) return null
  return parsed
}

export default function ProjectTypeFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [panelMounted, setPanelMounted] = useState(false)
  const [panelEntered, setPanelEntered] = useState(false)
  const [types, setTypes] = useState<ProjectTypeRow[]>([])
  const [expandedCode, setExpandedCode] = useState<number | null>(null)
  const selectedType = parsePositiveInt(searchParams.get('type'))
  const selectedTypology = parsePositiveInt(searchParams.get('typology'))
  const hasFilter = selectedType != null || selectedTypology != null

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const rows = await fetchJson<ProjectTypeRow[]>('/api/project-types')
        if (!cancelled) setTypes(rows)
      } catch {
        if (!cancelled) setTypes([])
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount panel before open transition
      setPanelMounted(true)
      let cancelled = false
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setPanelEntered(true)
        })
      })
      return () => {
        cancelled = true
        cancelAnimationFrame(id)
      }
    }

    setPanelEntered(false)
    const t = window.setTimeout(() => setPanelMounted(false), 450)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    setExpandedCode(selectedType)
    // selectedType is read when the menu opens; omit it so chevron toggles stay put.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onPanelTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.propertyName !== 'transform') return
    if (!open) setPanelMounted(false)
  }

  function applyFilter(typeCode: number, typologyId: number | null) {
    const next = new URLSearchParams(searchParams)
    next.set('type', String(typeCode))
    if (typologyId == null) next.delete('typology')
    else next.set('typology', String(typologyId))
    setSearchParams(next, { replace: true })
    setOpen(false)
  }

  function toggleExpanded(code: number) {
    setExpandedCode((current) => (current === code ? null : code))
  }

  return (
    <div className="projectTypeFilter">
      <button
        type="button"
        className={`projectTypeFilterButton${hasFilter ? ' projectTypeFilterButton--active' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="project-type-filter-menu"
        aria-haspopup="true"
        aria-label={open ? 'Close filter' : 'Filter projects by type'}
      >
        <span className="projectTypeFilterIcon" aria-hidden="true">
          <span className="filterIcon__bar filterIcon__bar--top" />
          <span className="filterIcon__bar filterIcon__bar--mid" />
          <span className="filterIcon__bar filterIcon__bar--bot" />
          <span className="filterIcon__knob filterIcon__knob--topRight" />
          <span className="filterIcon__knob filterIcon__knob--midLeft" />
          <span className="filterIcon__knob filterIcon__knob--botRight" />
        </span>
      </button>
      {panelMounted ? (
        <div className="projectTypeFilterPanelClip">
          <div
            className={`projectTypeFilterPanel${panelEntered ? ' projectTypeFilterPanel--open' : ''}`}
            onTransitionEnd={onPanelTransitionEnd}
          >
            <ul
              id="project-type-filter-menu"
              className="projectTypeFilterMenu"
              aria-label="Project types"
            >
              {types.map((type) => {
                const typologies = type.typologies ?? []
                const hasTypologies = typologies.length > 0
                const isExpanded = expandedCode === type.code
                const typeActive = selectedType === type.code
                const viewAllActive = typeActive && selectedTypology == null
                return (
                  <li key={type.code} className="projectTypeFilterGroup">
                    <div className="projectTypeFilterGroupHead">
                      {hasTypologies ? (
                        <button
                          type="button"
                          className="projectTypeFilterChevron"
                          aria-expanded={isExpanded}
                          aria-controls={`project-type-filter-${type.code}`}
                          aria-label={`${isExpanded ? 'Hide' : 'Show'} ${type.description_en} typologies`}
                          onClick={() => toggleExpanded(type.code)}
                        >
                          <span className="projectTypeFilterChevronMark" aria-hidden="true" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        aria-expanded={hasTypologies ? isExpanded : undefined}
                        aria-current={!hasTypologies && typeActive ? 'true' : undefined}
                        className={`projectTypeFilterOption${typeActive ? ' projectTypeFilterOption--active' : ''}`}
                        onClick={() =>
                          hasTypologies
                            ? toggleExpanded(type.code)
                            : applyFilter(type.code, null)
                        }
                      >
                        {type.description_en}
                      </button>
                    </div>
                    {hasTypologies ? (
                      <div
                        id={`project-type-filter-${type.code}`}
                        className={`projectTypeFilterTypologies${isExpanded ? ' projectTypeFilterTypologies--open' : ''}`}
                      >
                        <ul className="projectTypeFilterTypologiesList">
                          <li>
                            <button
                              type="button"
                              aria-current={viewAllActive ? 'true' : undefined}
                              className={`projectTypeFilterOption projectTypeFilterOption--typology${viewAllActive ? ' projectTypeFilterOption--active' : ''}`}
                              onClick={() => applyFilter(type.code, null)}
                            >
                              View All
                            </button>
                          </li>
                          {typologies.map((typology) => {
                            const isActive =
                              typeActive && selectedTypology === typology.id
                            return (
                              <li key={typology.id}>
                                <button
                                  type="button"
                                  aria-current={isActive ? 'true' : undefined}
                                  className={`projectTypeFilterOption projectTypeFilterOption--typology${isActive ? ' projectTypeFilterOption--active' : ''}`}
                                  onClick={() => applyFilter(type.code, typology.id)}
                                >
                                  {typology.description_en}
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
