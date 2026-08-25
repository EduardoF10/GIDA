import { useLocation } from 'react-router-dom'
import MenuTabs from './MenuTabs.tsx'
import './Tabs.css'

export default function Tabs() {
  const { pathname } = useLocation()

  return (
    <nav className="topTabs" aria-label="Primary">
      <div className="topTabsInner topTabsInner--compact">
        <MenuTabs key={pathname} />
      </div>
    </nav>
  )
}
