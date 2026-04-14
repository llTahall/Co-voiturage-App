import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute, { RoleProtectedRoute } from './components/ProtectedRoute'

import Navbar from './components/Navbar'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import CreateAnnoncePage from './pages/CreateAnnoncePage'
import MyAnnoncesPage from './pages/MyAnnoncesPage'
import MyReservationsPage from './pages/MyReservationsPage'
import ProfilePage from './pages/ProfilePage'
import MesPassagersPage from './pages/MesPassagersPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />

          <Route element={<RoleProtectedRoute role="CONDUCTEUR" />}>
            <Route path="/annonces/create" element={<CreateAnnoncePage />} />
            <Route path="/mes-passagers" element={<MesPassagersPage />} />

          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/mes-annonces" element={<MyAnnoncesPage />} />
            <Route path="/mes-reservations" element={<MyReservationsPage />} />
            <Route path="/profil" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
