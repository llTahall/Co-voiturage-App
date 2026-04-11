import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl text-brand-600 tracking-tight">
          CoVoiture
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/search" className="text-stone-600 hover:text-brand-600 transition-colors duration-200">
            Rechercher
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'CONDUCTEUR' && (
                <Link to="/annonces/create" className="text-stone-600 hover:text-brand-600 transition-colors duration-200">
                  Publier
                </Link>
              )}
              <Link to="/mes-annonces" className="text-stone-600 hover:text-brand-600 transition-colors duration-200">
                Mes annonces
              </Link>
              <Link to="/mes-reservations" className="text-stone-600 hover:text-brand-600 transition-colors duration-200">
                Réservations
              </Link>
              <Link to="/profil" className="text-stone-600 hover:text-brand-600 transition-colors duration-200">
                {user?.prenom}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-full border border-stone-300 text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-stone-600 hover:text-brand-600 transition-colors duration-200">
                Connexion
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors duration-200"
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
