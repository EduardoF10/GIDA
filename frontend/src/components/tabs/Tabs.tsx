import { useLocation } from 'react-router-dom'
import MenuTabs from './MenuTabs.tsx'
import ProjectTypeFilter from './ProjectTypeFilter.tsx'
import './Tabs.css'

export default function Tabs() {
  const { pathname } = useLocation()
  const showProjectFilter = pathname === '/projects'

  return (
    <nav className="topTabs" aria-label="Primary">
      <div className="topTabsInner topTabsInner--compact">
        <MenuTabs key={pathname} />
        {showProjectFilter ? <ProjectTypeFilter /> : null}
      </div>
    </nav>
  )
}
