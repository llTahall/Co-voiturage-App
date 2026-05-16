import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { RoleProtectedRoute } from './components/ProtectedRoute'

import ConducteurNavbar from './components/ConducteurNavbar'
import PassagerNavbar from './components/PassagerNavbar'
import ReservationToastOverlay from './components/ReservationToast'
import LandingPage from './pages/LandingPage'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'

import ConducteurHomePage from './pages/conducteur/ConducteurHomePage'
import CreateAnnoncePage from './pages/conducteur/CreateAnnoncePage'
import MyAnnoncesPage from './pages/conducteur/MyAnnoncesPage'
import MesPassagersPage from './pages/conducteur/MesPassagersPage'

import PassagerHomePage from './pages/passager/PassagerHomePage'
import SearchPage from './pages/passager/SearchPage'
import MyReservationsPage from './pages/passager/MyReservationsPage'

function SmartRedirect() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <LandingPage />
  if (user?.role === 'CONDUCTEUR') return <Navigate to="/conducteur/home" replace />
  return <Navigate to="/passager/home" replace />
}

function AppInner() {
  const { isAuthenticated, user } = useAuth()
  const isConducteur = user?.role === 'CONDUCTEUR'
  const isPassager = user?.role === 'PASSAGER'

  return (
    <>
      {isAuthenticated && isConducteur && <ConducteurNavbar />}
      {isAuthenticated && isPassager && <PassagerNavbar />}
      <ReservationToastOverlay />

      <Routes>
        <Route path="/" element={<SmartRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchPage />} />

        <Route element={<RoleProtectedRoute role="CONDUCTEUR" />}>
          <Route path="/conducteur/home" element={<ConducteurHomePage />} />
          <Route path="/conducteur/profil" element={<ProfilePage />} />
          <Route path="/annonces/create" element={<CreateAnnoncePage />} />
          <Route path="/mes-annonces" element={<MyAnnoncesPage />} />
          <Route path="/mes-passagers" element={<MesPassagersPage />} />
        </Route>

        <Route element={<RoleProtectedRoute role="PASSAGER" />}>
          <Route path="/passager/home" element={<PassagerHomePage />} />
          <Route path="/passager/profil" element={<ProfilePage />} />
          <Route path="/mes-reservations" element={<MyReservationsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  )
}
