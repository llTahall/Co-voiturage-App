import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMesReservations } from '../../api/reservationAPI'

const statusConfig = {
    EN_ATTENTE: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    ACCEPTEE: { label: 'Acceptée', cls: 'bg-brand-50 text-brand-700 border-brand-200' },
}

export default function PassagerHomePage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ villeDepart: '', villeArrivee: '', date: '' })
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getMesReservations()
            .then(({ data }) => setReservations(data))
            .finally(() => setLoading(false))
    }, [])

    const actives = reservations.filter(r => r.statut === 'EN_ATTENTE' || r.statut === 'ACCEPTEE')

    const handleSearch = (e) => {
        e.preventDefault()
        navigate(`/search?${new URLSearchParams(form).toString()}`)
    }

    return (
        <div className="min-h-screen pt-[68px] bg-[#F4F4F4]">

            {/* Hero */}
            <section className="bg-[#00854B] pt-12 pb-14 px-6">
                <div className="max-w-3xl mx-auto">
                    <p className="text-white/70 text-sm font-medium mb-1">Bonjour, {user?.prenom}</p>
                    <h1 className="text-white text-3xl font-display font-bold tracking-[-0.03em] mb-8">
                        Où voulez-vous aller ?
                    </h1>
                    <form
                        onSubmit={handleSearch}
                        className="bg-white rounded-2xl p-3 flex flex-col md:flex-row gap-2 shadow-[0_4px_24px_rgba(0,0,0,0.18)]"
                    >
                        <div className="flex-1 relative">
                            <label className="absolute left-4 top-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#8AA899]">Départ</label>
                            <input
                                placeholder="Casablanca, Rabat…"
                                value={form.villeDepart}
                                onChange={e => setForm(f => ({ ...f, villeDepart: e.target.value }))}
                                className="w-full pt-7 pb-2.5 px-4 rounded-xl text-sm text-[#1A1A1A] placeholder-[#B0C4BA] focus:outline-none focus:bg-[#F0FBF5] transition-[background-color] duration-200 font-medium"
                            />
                        </div>
                        <div className="hidden md:flex items-center text-[#C8D9D0] font-bold text-lg">→</div>
                        <div className="flex-1 relative">
                            <label className="absolute left-4 top-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#8AA899]">Arrivée</label>
                            <input
                                placeholder="Marrakech, Fès…"
                                value={form.villeArrivee}
                                onChange={e => setForm(f => ({ ...f, villeArrivee: e.target.value }))}
                                className="w-full pt-7 pb-2.5 px-4 rounded-xl text-sm text-[#1A1A1A] placeholder-[#B0C4BA] focus:outline-none focus:bg-[#F0FBF5] transition-[background-color] duration-200 font-medium"
                            />
                        </div>
                        <div className="w-px hidden md:block bg-[#EAF0EC] self-stretch" />
                        <div className="relative">
                            <label className="absolute left-4 top-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#8AA899]">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                className="w-full md:w-auto pt-7 pb-2.5 px-4 rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:bg-[#F0FBF5] transition-[background-color] duration-200 font-medium"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-7 py-3 rounded-xl bg-[#00854B] text-white text-sm font-bold hover:bg-[#006D3D] active:scale-[0.97] transition-[background-color,transform] duration-150 whitespace-nowrap"
                        >
                            Rechercher
                        </button>
                    </form>
                </div>
            </section>

            <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

                {!loading && actives.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-display font-bold text-[#111713]">Réservations en cours</h2>
                            <Link to="/mes-reservations" className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-[color] duration-150">
                                Voir tout
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {actives.slice(0, 2).map(r => <ReservationRow key={r.id} r={r} />)}
                        </div>
                    </section>
                )}

                {!loading && actives.length === 0 && (
                    <div className="text-center py-14 bg-white rounded-2xl border border-[rgba(0,0,0,0.07)]">
                        <p className="text-[#1A1A1A] font-semibold text-lg mb-1">Aucune réservation active</p>
                        <p className="text-[#888] text-sm mb-6">Recherchez un trajet ci-dessus pour faire votre première demande.</p>
                        <Link
                            to="/search"
                            className="inline-flex px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition-[background-color] duration-150 shadow-[0_2px_8px_rgba(0,133,75,0.35)]"
                        >
                            Parcourir les trajets
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

function ReservationRow({ r }) {
    const villeDepart = r.annonce?.trajet?.villeDepart ?? '—'
    const villeArrivee = r.annonce?.trajet?.villeArrivee ?? '—'
    const cfg = statusConfig[r.statut] ?? statusConfig.EN_ATTENTE
    const dateStr = r.annonce?.dateDepart
        ? new Date(r.annonce.dateDepart).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
        : '—'

    return (
        <div className="bg-white rounded-xl border border-brand-200 ring-1 ring-brand-100 px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-2 font-display font-bold text-[#1A1A1A] min-w-0">
                    <span className="truncate">{villeDepart}</span>
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="shrink-0 text-brand-500">
                        <path d="M1 5h11M8 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="truncate">{villeArrivee}</span>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${cfg.cls}`}>
                    {cfg.label}
                </span>
            </div>
            <p className="text-xs text-[#8AA899] shrink-0">{dateStr}</p>
        </div>
    )
}
