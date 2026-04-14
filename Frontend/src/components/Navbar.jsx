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
    <nav className="fixed top-0 inset-x-0 z-50 bg-white shadow-[0_1px_0_rgba(0,0,0,0.07),0_2px_12px_rgba(0,0,0,0.05)]">
      <div className="max-w-6xl mx-auto px-6 h-[68px] flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-brand transition-[transform] duration-200 group-hover:scale-[1.06]">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M3 11.5L4.5 8.5H12.5L14 11.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M2 11.5H15V13.5H2V11.5Z" fill="white" fillOpacity="0.15" />
              <rect x="2" y="11" width="13" height="2.5" rx="1.25" fill="white" fillOpacity="0.9" />
              <circle cx="5" cy="14" r="1.25" fill="white" />
              <circle cx="12" cy="14" r="1.25" fill="white" />
              <path d="M5.5 8.5L7 5.5H10L11.5 8.5H5.5Z" fill="white" fillOpacity="0.75" />
            </svg>
          </div>
          <span className="font-display text-[1.2rem] font-bold tracking-[-0.03em] text-[#111713]">
            Co<span className="text-brand-600">Voiture</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1">

          {/* Rechercher : passagers & invités uniquement */}
          {!isConducteur && <NavLink to="/search">Rechercher</NavLink>}

          {isAuthenticated ? (
            <>
              {/* Conducteur */}
              {isConducteur && (
                <>
                  <NavLink to="/annonces/create">Publier</NavLink>

                  {/* Mes annonces avec badge notifications */}
                  <Link
                    to="/mes-annonces"
                    className="relative px-3.5 py-2 rounded-full text-sm font-medium text-[#4A6A55] hover:text-brand-700 hover:bg-brand-50 transition-[color,background-color] duration-150"
                  >
                    Mes annonces
                    {pendingCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* Passager */}
              {isPassager && (
                <NavLink to="/mes-reservations">Mes réservations</NavLink>
              )}

              {/* Profil + logout */}
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-[#E5EDE8]">
                <Link
                  to="/profil"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-brand-50 transition-[background-color] duration-150"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-[11px] font-bold text-brand-700 uppercase tracking-wide">
                    {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-[#111713]">{user?.prenom}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-full border border-[#D5E5DC] text-xs font-semibold text-[#4A6A55] hover:border-brand-500 hover:text-brand-700 hover:bg-brand-50 active:scale-[0.96] transition-[border-color,color,background-color,transform] duration-150"
                >
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login">Connexion</NavLink>
              <Link
                to="/register"
                className="ml-2 px-5 py-2 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-[0.96] transition-[background-color,transform] duration-150 shadow-brand"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
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
