import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '../context/NotificationContext'

const typeConfig = {
    NOUVELLE_RESERVATION:        { label: 'Nouvelle réservation',       dot: 'bg-amber-400' },
    RESERVATION_ACCEPTEE:        { label: 'Réservation acceptée',        dot: 'bg-brand-500' },
    RESERVATION_REFUSEE:         { label: 'Réservation refusée',         dot: 'bg-red-400' },
    RESERVATION_ANNULEE_PASSAGER:{ label: 'Réservation annulée',         dot: 'bg-stone-400' },
    RESERVATION_ANNULEE_CONDUCTEUR:{ label: 'Trajet annulé',             dot: 'bg-red-400' },
    NOUVELLE_ANNONCE:            { label: 'Nouveau trajet disponible',   dot: 'bg-brand-400' },
    ANNONCE_ANNULEE:             { label: 'Trajet annulé',               dot: 'bg-stone-400' },
    ANNONCE_MISE_A_JOUR:         { label: 'Places disponibles',          dot: 'bg-brand-400' },
    TRAJET_DEMARRE:              { label: 'Trajet en cours',             dot: 'bg-blue-400' },
    TRAJET_TERMINE:              { label: 'Trajet terminé',              dot: 'bg-stone-400' },
    EVALUATION_RECUE:            { label: 'Nouvel avis reçu',            dot: 'bg-brand-500' },
}

export default function NotificationBell() {
    const { notifications, unreadCount, markAllRead } = useNotifications()
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const toggle = () => {
        const next = !open
        setOpen(next)
        if (next) markAllRead()
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={toggle}
                className="relative w-7 h-7 flex items-center justify-center text-[#4A4A42] hover:text-[#111713] transition-[color] duration-150"
                aria-label="Notifications"
            >
                <svg width="17" height="18" viewBox="0 0 17 18" fill="none">
                    <path d="M13.5 7.5A5 5 0 003.5 7.5v3.5L2 13.5h13L13.5 11V7.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M6.5 13.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center px-0.5 leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <div
                className={`absolute top-full mt-2 w-80 bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50 origin-top overflow-hidden transition-[opacity,transform] duration-150 ${
                    open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
                }`}
                style={{ right: 0 }}
            >
                <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.06)]">
                    <span className="text-sm font-bold text-[#111713]">Notifications</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[rgba(0,0,0,0.04)]">
                    {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <p className="text-sm text-[#999]">Aucune notification</p>
                        </div>
                    ) : (
                        notifications.map(n => {
                            const cfg = typeConfig[n.type] ?? { label: n.type, dot: 'bg-[#CCC]' }
                            const time = n.timestamp
                                ? new Date(n.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                : ''
                            return (
                                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#FAFAFA] transition-[background-color] duration-150">
                                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wide">{cfg.label}</p>
                                        <p className="text-sm text-[#333] mt-0.5 leading-snug">{n.message}</p>
                                        {time && <p className="text-[10px] text-[#BBB] mt-1">{time}</p>}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
