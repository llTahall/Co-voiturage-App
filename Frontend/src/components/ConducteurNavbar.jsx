import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { useEffect, useState, useRef } from 'react'
import { getMesPassagers } from '../api/reservationAPI'
import NotificationBell from './NotificationBell'

export default function ConducteurNavbar() {
    const { user, logout } = useAuth()
    const { notifications } = useNotifications()
    const navigate = useNavigate()
    const [pending, setPending] = useState(0)
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)

    const fetchPending = () => getMesPassagers()
        .then(({ data }) => setPending(data.filter(r => r.statut === 'EN_ATTENTE').length))
        .catch(() => { })

    // fetch une seule fois au montage
    useEffect(() => { fetchPending() }, [])

    useEffect(() => {
        const latest = notifications[0]
        if (latest?.type === 'NOUVELLE_RESERVATION' || latest?.type === 'RESERVATION_ANNULEE_PASSAGER') fetchPending()
    }, [notifications.length])

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleLogout = () => { logout(); navigate('/') }
    const initials = `${user?.prenom?.charAt(0) ?? ''}${user?.nom?.charAt(0) ?? ''}`.toUpperCase()

    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-white shadow-[0_1px_0_rgba(0,0,0,0.07)] flex items-center justify-center gap-8 px-10 h-[64px]">

            <NavLink to="/conducteur/home">Accueil</NavLink>
            <NavLink to="/annonces/create">Publier</NavLink>

            <Link to="/mes-annonces" className="relative text-sm font-semibold text-[#4A4A42] hover:text-[#111713] transition-[color] duration-150">
                Mes annonces
                {pending > 0 && (
                    <span className="absolute -top-1.5 -right-3 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                        {pending > 9 ? '9+' : pending}
                    </span>
                )}
            </Link>

            <NavLink to="/mes-passagers">Mes passagers</NavLink>

            <NotificationBell />

            {/* Profil dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setOpen(v => !v)}
                    className="w-7 h-7 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[11px] font-bold text-brand-700 uppercase hover:bg-brand-100 transition-[background-color] duration-150"
                >
                    {initials}
                </button>

                <div
                    className={`absolute top-full mt-2 w-44 bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-[0_8px_24px_rgba(0,0,0,0.12)] py-1 z-50 transition-[opacity,transform] duration-150 origin-top ${open
                        ? 'opacity-100 scale-y-100 pointer-events-auto'
                        : 'opacity-0 scale-y-95 pointer-events-none'
                        }`}
                    style={{ left: '50%', transform: open ? 'translateX(-50%) scaleY(1)' : 'translateX(-50%) scaleY(0.95)' }}
                >
                    <Link
                        to="/conducteur/profil"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#4A4A42] hover:bg-[#F4F4F4] hover:text-[#111713] transition-[background-color,color] duration-150"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M1.5 12.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                        Paramètres
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-[background-color] duration-150"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M5.5 7h6M9 4.5l2.5 2.5L9 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 2H3a1 1 0 00-1 1v8a1 1 0 001 1h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                        Déconnexion
                    </button>
                </div>
            </div>
        </nav>
    )
}

function NavLink({ to, children }) {
    return (
        <Link to={to} className="text-sm font-semibold text-[#4A4A42] hover:text-[#111713] transition-[color] duration-150">
            {children}
        </Link>
    )
}
