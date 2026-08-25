import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import IntroSplash from './pages/intro/IntroSplash.tsx'
import Tabs from './components/tabs/Tabs.tsx'
import About from './pages/About.tsx'
import Projects from './pages/projects/Projects.tsx'
import Services from './pages/Services.tsx'
import People from './pages/People.tsx'
import Contact from './pages/Contact.tsx'
import AdminLogin from './pages/admin/Login.tsx'
import RequireAdmin from './pages/admin/RequireAdmin.tsx'
import AdminProjectsList from './pages/admin/ProjectsList.tsx'
import AdminProjectEdit from './pages/admin/ProjectEdit.tsx'

function App() {
  return (
    <>
      <IntroSplash />
      <div className="appLayout">
      <Tabs />
      <main className="pageContent">
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/architecture" element={<Navigate to="/projects" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/people" element={<People />} />
          <Route path="/interiors" element={<Navigate to="/services" replace />} />
          <Route path="/designs" element={<Navigate to="/people" replace />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/projects" replace />} />
          <Route
            path="/admin/projects"
            element={
              <RequireAdmin>
                <AdminProjectsList />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/projects/:id"
            element={
              <RequireAdmin>
                <AdminProjectEdit />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>
    </div>
    </>
  )
}

export default App
