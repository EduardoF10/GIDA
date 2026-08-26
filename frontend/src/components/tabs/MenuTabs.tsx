import { useEffect, useState, type TransitionEvent } from 'react'
import { NavLink } from 'react-router-dom'
import AppIconPlain from '../AppIconPlain'
import logoText from '../../assets/app_logo_text_header.png'
import { lockDocumentScroll } from '../../lib/scrollLock'
import { TAB_ITEMS } from './TabNavItems'
import './MenuTabs.css'

export default function MenuTabs() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [drawerMounted, setDrawerMounted] = useState(false)
  const [drawerEntered, setDrawerEntered] = useState(false)

  useEffect(() => {
    if (menuOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount drawer before open transition
      setDrawerMounted(true)
      let cancelled = false
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setDrawerEntered(true)
        })
      })
      return () => {
        cancelled = true
        cancelAnimationFrame(id)
      }
    }
    setDrawerEntered(false)
  }, [menuOpen])

  useEffect(() => {
    if (!drawerMounted) return
    return lockDocumentScroll()
  }, [drawerMounted])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const onDrawerTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== 'transform') return
    if (!menuOpen) setDrawerMounted(false)
  }

  return (
    <div className="tabMenuCompact">
      <button
        type="button"
        className="tabMenuButton"
        onClick={() => setMenuOpen((o) => !o)}
        aria-expanded={menuOpen}
        aria-controls="tab-menu-panel"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        id="tab-menu-button"
      >
        <AppIconPlain className="tabMenuLogo" />
      </button>
      <img
        className="tabMenuWordmark"
        src={logoText}
        alt="Horacio Diaz & Associates"
        width={2028}
        height={378}
        decoding="async"
        draggable={false}
      />
      {drawerMounted ? (
        <>
          <button
            type="button"
            className="tabMenuBackdrop"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="tab-menu-panel"
            className={`tabMenuDrawer${drawerEntered ? ' tabMenuDrawer--open' : ''}`}
            role="navigation"
            aria-label="Sections"
            onTransitionEnd={onDrawerTransitionEnd}
          >
            <div className="tabMenuDrawerInner">
              {TAB_ITEMS.map(({ to, end, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    isActive ? 'tabMenuLink tabMenuLink--active' : 'tabMenuLink'
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
