import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getMesReservations } from '../../api/reservationAPI'
import { useNotifications } from '../../context/NotificationContext'
import mapImg from '../../assets/pexels-marina-zasorina-7634150.jpg'

const statusConfig = {
    EN_ATTENTE: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    ACCEPTEE: { label: 'Acceptée', cls: 'bg-brand-50 text-brand-700 border-brand-200' },
}

const REFRESH_EVENTS = new Set([
    'RESERVATION_ACCEPTEE', 'RESERVATION_REFUSEE',
    'RESERVATION_ANNULEE_CONDUCTEUR', 'ANNONCE_ANNULEE', 'TRAJET_TERMINE',
])

export default function PassagerHomePage() {
    const navigate = useNavigate()
    const { notifications } = useNotifications()
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)

    const load = () => getMesReservations()
        .then(({ data }) => setReservations(data))
        .finally(() => setLoading(false))

    useEffect(() => { load() }, [])

    useEffect(() => {
        const latest = notifications[0]
        if (latest && REFRESH_EVENTS.has(latest.type)) load()
    }, [notifications.length])

    const actives = reservations.filter(r =>
        (r.statut === 'EN_ATTENTE' || r.statut === 'ACCEPTEE') &&
        r.annonce?.statut !== 'TERMINEE' &&
        r.annonce?.statut !== 'ANNULEE'
    )

    return (
        <div className="min-h-screen pt-[64px] bg-white">

            {/* Section 1 — Hero */}
            <div className="max-w-6xl mx-auto px-10 py-20 flex items-center gap-16">

                {/* Left — image */}
                <div className="w-[48%] shrink-0 rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    <img
                        src={mapImg}
                        alt="Carte routière"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center 25%' }}
                    />
                </div>

                {/* Right — text */}
                <div className="flex-1">
                    <h1 className="font-display font-bold text-[2.6rem] leading-[1.1] tracking-[-0.03em] text-[#111713] mb-5">
                        Trouvez votre trajet.<br />Voyagez malin.
                    </h1>
                    <p className="text-[#555] text-base leading-[1.75] mb-8 max-w-[460px]">
                        Recherchez parmi des centaines de trajets proposés par des conducteurs de confiance. Partagez les frais et voyagez en toute simplicité.
                    </p>

                    {!loading && actives.length > 0 && (
                        <div className="flex items-center gap-2.5 mb-6 px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-700 w-fit">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                                <path d="M5 7l1.5 1.5L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>
                                <span className="font-semibold">{actives.length} réservation{actives.length > 1 ? 's' : ''}</span>
                                {' '}active{actives.length > 1 ? 's' : ''} —{' '}
                                <Link to="/mes-reservations" className="underline underline-offset-2 hover:text-brand-800 transition-[color] duration-150">
                                    voir
                                </Link>
                            </span>
                        </div>
                    )}

                    <Link
                        to="/search"
                        className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 active:scale-[0.97] transition-[background-color,transform] duration-150"
                        style={{ boxShadow: '0 4px 20px rgba(0,133,75,0.35)' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="6" cy="6" r="4.5" stroke="white" strokeWidth="1.6" />
                            <path d="M9.5 9.5l3 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                        Rechercher un trajet
                    </Link>
                </div>
            </div>

            {/* Section 2 — Comment ça marche */}
            <div className="bg-[#F7F8F6] border-t border-[rgba(0,0,0,0.06)]">
                <div className="max-w-6xl mx-auto px-10 py-20">
                    <h2 className="font-display font-bold text-[1.9rem] tracking-[-0.03em] text-[#111713] mb-2">
                        Comment ça marche ?
                    </h2>
                    <p className="text-[#666] text-sm mb-12">Réservez votre place en trois étapes simples.</p>

                    <div className="grid grid-cols-3 gap-8">
                        <Step
                            number="01"
                            title="Recherchez un trajet"
                            desc="Entrez votre départ, destination et date. Trouvez instantanément les trajets disponibles près de chez vous."
                            icon={
                                <>
                                    <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </>
                            }
                        />
                        <Step
                            number="02"
                            title="Faites votre demande"
                            desc="Choisissez un trajet qui vous convient et envoyez une demande de réservation au conducteur."
                            icon={
                                <>
                                    <path d="M2 10V4a1 1 0 011-1h9a1 1 0 011 1v6a1 1 0 01-1 1H8l-3 2v-2H3a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                    <path d="M5 7h5M5 5.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                </>
                            }
                        />
                        <Step
                            number="03"
                            title="Voyagez ensemble"
                            desc="Une fois accepté par le conducteur, préparez-vous à partir. Partagez les frais et profitez du trajet."
                            icon={
                                <>
                                    <path d="M2 9.5l2-5h8l2 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <rect x="1.5" y="9.5" width="13" height="2.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
                                    <circle cx="5" cy="12" r="1" fill="currentColor" />
                                    <circle cx="11" cy="12" r="1" fill="currentColor" />
                                </>
                            }
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}

function Step({ number, title, desc, icon }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                {/* <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shrink-0"
                    style={{ boxShadow: '0 2px 12px rgba(0,133,75,0.3)' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">{icon}</svg>
                </div> */}
                {/* <span className="text-[11px] font-bold text-brand-600 tracking-widest">{number}</span> */}
            </div>
            <h3 className="font-display font-bold text-[1.05rem] text-[#111713] leading-tight">{title}</h3>
            <p className="text-[#666] text-sm leading-[1.7]">{desc}</p>
        </div>
    )
}
