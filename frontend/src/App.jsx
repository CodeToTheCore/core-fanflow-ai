import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'



import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './styles/globals.css'
 
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Superfans from './pages/SuperFans.jsx'
import Campaigns from './pages/Campaigns'
import GigEngine from './pages/GigEngine'

import ResumeAI from "./pages/ResumeAI.jsx";

import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Sidebar from './components/layout/Sidebar'
import Navbar from './components/layout/Navbar'
import { useArtistStore } from './store/ArtistStore.js'
 
function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0A0A0F' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
 
export default function App() {
  const { isAuthenticated } = useArtistStore()
 
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A26',
            color: '#F0F0FF',
            border: '1px solid #2A2A3A',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#FF6B00', secondary: '#0A0A0F' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#0A0A0F' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard"
          element={
            <AppLayout><Dashboard /></AppLayout>
          }
        />
        <Route
          path="/superfans"
          element={
            <AppLayout><Superfans /></AppLayout>
          }
        />
        <Route
          path="/campaigns"
          element={
            <AppLayout><Campaigns /></AppLayout>
          }
        />
        <Route
          path="/gigs"
          element={
            <AppLayout><GigEngine /></AppLayout>
          }
        />
        <Route
          path="/resume"
          element={
            <AppLayout><ResumeAI /></AppLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <AppLayout><Analytics /></AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout><Settings /></AppLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
};


