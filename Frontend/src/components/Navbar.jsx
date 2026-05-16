import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { getMesPassagers } from '../api/reservationAPI'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)

  const isConducteur = user?.role === 'CONDUCTEUR'
  const isPassager = user?.role === 'PASSAGER'

  useEffect(() => {
    if (!isConducteur) return

    const fetchPending = () => {
      getMesPassagers()
        .then(({ data }) => {
          setPendingCount(data.filter(r => r.statut === 'EN_ATTENTE').length)
        })
        .catch(() => { })
    }

    fetchPending()
    const interval = setInterval(fetchPending, 30000)
    return () => clearInterval(interval)
  }, [isConducteur])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div>
      < nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-10 px-10 py-6" >
        <Link
          to="/search"
          className="text-sm font-semibold text-white/60 hover:text-white transition-[color] duration-150"
        >
          Rechercher
        </Link>
        <Link
          to="/login"
          className="text-sm font-semibold text-white/60 hover:text-white transition-[color] duration-150"
        >
          Connexion
        </Link>
        <Link
          to="/register"
          className="px-5 py-2 rounded-full bg-[#00854B] text-white text-sm font-bold hover:bg-[#006D3D] active:scale-[0.97] transition-[background-color,transform] duration-150"
        >
          S'inscrire
        </Link>
      </nav >

    </div>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="px-3.5 py-2 rounded-full text-sm font-medium text-[#4A6A55] hover:text-brand-700 hover:bg-brand-50 transition-[color,background-color] duration-150"
    >
      {children}
    </Link>
  )
}
