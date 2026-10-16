import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './styles/globals.css'

import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Superfans from './pages/SuperFans'
import Campaigns from './pages/Campaigns'
import GigEngine from './pages/GigEngine'
import ResumeAI from './pages/ResumeAI'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import MediaStudio from './pages/MediaStudio'
import Portfolio from './pages/Portfolio'
import Sidebar from './components/layout/Sidebar'
import Navbar from './components/layout/Navbar'
import DemoBanner from './components/layout/DemoBanner'

function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0A0A0F' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DemoBanner />
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1A1A26', color: '#F0F0FF', border: '1px solid #2A2A3A' },
        success: { iconTheme: { primary: '#FF6B00', secondary: '#0A0A0F' } },
      }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/superfans" element={<AppLayout><Superfans /></AppLayout>} />
        <Route path="/campaigns" element={<AppLayout><Campaigns /></AppLayout>} />
        <Route path="/gigs" element={<AppLayout><GigEngine /></AppLayout>} />
        <Route path="/resume" element={<AppLayout><ResumeAI /></AppLayout>} />
        <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
        <Route path="/media" element={<AppLayout><MediaStudio /></AppLayout>} />
        <Route path="/portfolio" element={<AppLayout><Portfolio /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}
