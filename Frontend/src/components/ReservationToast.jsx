import { useState, useEffect } from 'react'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import { accepterReservation, refuserReservation } from '../api/reservationAPI'

export default function ReservationToastOverlay() {
    const { user } = useAuth()
    const { notifications } = useNotifications()
    const [toasts, setToasts] = useState([])

    useEffect(() => {
        const latest = notifications[0]
        if (!latest) return

        const isConducteurEvent = user?.role === 'CONDUCTEUR' && latest.type === 'NOUVELLE_RESERVATION'
        const isPassagerEvent = user?.role === 'PASSAGER' &&
            (latest.type === 'RESERVATION_ACCEPTEE' || latest.type === 'RESERVATION_REFUSEE' || latest.type === 'RESERVATION_ANNULEE_CONDUCTEUR')

        if (!isConducteurEvent && !isPassagerEvent) return

        setToasts(prev => {
            if (prev.find(t => t.notifId === latest.id)) return prev
            return [...prev, {
                notifId: latest.id,
                type: latest.type,
                reservationId: latest.referenceId,
                message: latest.message,
            }]
        })
    }, [notifications.length])

    const dismiss = (notifId) => setToasts(prev => prev.filter(t => t.notifId !== notifId))

    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast =>
                toast.type === 'NOUVELLE_RESERVATION' ? (
                    <ConducteurToastCard
                        key={toast.notifId}
                        toast={toast}
                        onAccept={async () => { await accepterReservation(toast.reservationId); dismiss(toast.notifId) }}
                        onRefuse={async () => { await refuserReservation(toast.reservationId); dismiss(toast.notifId) }}
                        onDismiss={() => dismiss(toast.notifId)}
                    />
                ) : (
                    <PassagerToastCard
                        key={toast.notifId}
                        toast={toast}
                        onDismiss={() => dismiss(toast.notifId)}
                    />
                )
            )}
        </div>
    )
}

function ConducteurToastCard({ toast, onAccept, onRefuse, onDismiss }) {
    const [loading, setLoading] = useState(null)

    const handle = async (action, fn) => {
        setLoading(action)
        try { await fn() } catch { setLoading(null) }
    }

    return (
        <div className="pointer-events-auto w-80 bg-white rounded-2xl border border-[rgba(0,0,0,0.1)] shadow-[0_8px_32px_rgba(0,0,0,0.18)] overflow-hidden" style={{ animation: 'slideUp 0.2s ease-out' }}>
            <div className="bg-[#00854B] px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-white text-xs font-bold uppercase tracking-wide">Nouvelle réservation</span>
                </div>
                <button onClick={onDismiss} className="text-white/60 hover:text-white transition-[color] duration-150">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
            <div className="px-4 py-3">
                <p className="text-sm text-[#222] font-medium leading-snug">{toast.message}</p>
            </div>
            <div className="flex gap-2 px-4 pb-4">
                <button
                    onClick={() => handle('refuse', onRefuse)}
                    disabled={!!loading}
                    className="flex-1 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 active:scale-[0.97] transition-[background-color,transform] duration-150 disabled:opacity-50"
                >
                    {loading === 'refuse' ? '…' : 'Refuser'}
                </button>
                <button
                    onClick={() => handle('accept', onAccept)}
                    disabled={!!loading}
                    className="flex-1 py-2 rounded-xl bg-[#00854B] text-white text-xs font-bold hover:bg-[#006D3D] active:scale-[0.97] transition-[background-color,transform] duration-150 disabled:opacity-50 shadow-[0_2px_8px_rgba(0,133,75,0.3)]"
                >
                    {loading === 'accept' ? '…' : 'Accepter'}
                </button>
            </div>
        </div>
    )
}

const passagerConfig = {
    RESERVATION_ACCEPTEE: {
        bar: 'bg-[#00854B]',
        label: 'Réservation acceptée',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.4" />
                <path d="M5 8l2.5 2.5L11 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    RESERVATION_REFUSEE: {
        bar: 'bg-red-500',
        label: 'Réservation refusée',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.4" />
                <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    RESERVATION_ANNULEE_CONDUCTEUR: {
        bar: 'bg-stone-600',
        label: 'Trajet annulé',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.4" />
                <path d="M8 5v3.5M8 10.5v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
}

function PassagerToastCard({ toast, onDismiss }) {
    const cfg = passagerConfig[toast.type] ?? passagerConfig.RESERVATION_REFUSEE

    return (
        <div className="pointer-events-auto w-80 bg-white rounded-2xl border border-[rgba(0,0,0,0.1)] shadow-[0_8px_32px_rgba(0,0,0,0.18)] overflow-hidden" style={{ animation: 'slideUp 0.2s ease-out' }}>
            <div className={`${cfg.bar} px-4 py-2.5 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    {cfg.icon}
                    <span className="text-white text-xs font-bold uppercase tracking-wide">{cfg.label}</span>
                </div>
                <button onClick={onDismiss} className="text-white/60 hover:text-white transition-[color] duration-150">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
            <div className="px-4 py-4">
                <p className="text-sm text-[#222] font-medium leading-snug">{toast.message}</p>
            </div>
        </div>
    )
}
