import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMesAnnonces } from '../../api/annonceAPI'
import { getMesPassagers } from '../../api/reservationAPI'

export default function ConducteurHomePage() {
    const { user } = useAuth()
    const [annonces, setAnnonces] = useState([])
    const [passagers, setPassagers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([getMesAnnonces(), getMesPassagers()])
            .then(([a, p]) => {
                setAnnonces(a.data)
                setPassagers(p.data)
            })
            .finally(() => setLoading(false))
    }, [])

    const actives = annonces.filter(a => a.statut === 'PUBLIEE' || a.statut === 'COMPLETE')
    const terminees = annonces.filter(a => a.statut === 'TERMINEE')
    const enAttente = passagers.filter(r => r.statut === 'EN_ATTENTE')
    const hasActive = actives.length > 0
    const initials = `${user?.prenom?.charAt(0) ?? ''}${user?.nom?.charAt(0) ?? ''}`.toUpperCase()

    return (
        <div className="min-h-screen pt-[68px] bg-[#F4F4F4]">

            {/* Hero band */}
            <div className="bg-[#00854B] px-6 py-10">
                <div className="max-w-5xl mx-auto flex items-center gap-5">
                    <div
                        className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-xl font-display font-bold text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
                        style={{ background: 'linear-gradient(135deg, #059154 0%, #32ce87 100%)' }}
                    >
                        {initials}
                    </div>
                    <div>
                        <p className="text-white/70 text-sm font-medium">Bonjour,</p>
                        <h1 className="text-white text-2xl font-display font-bold tracking-[-0.03em]">
                            {user?.prenom} {user?.nom}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <StatCard value={loading ? '—' : actives.length} label="Annonces actives" accent="#00854B"
                        icon={<><rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" /><path d="M7 10h6M7 7h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>}
                    />
                    <StatCard value={loading ? '—' : enAttente.length} label="Passagers en attente" accent="#D97706"
                        icon={<><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" /><path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>}
                    />
                    <StatCard value={loading ? '—' : terminees.length} label="Trajets terminés" accent="#5A7265"
                        icon={<><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" /><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
                    />
                </div>

                {/* Actions rapides */}
                <section className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
                    <h2 className="text-base font-display font-bold text-[#111713] mb-5">Actions rapides</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {hasActive ? (
                            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#F0F0EC] opacity-60 cursor-not-allowed select-none">
                                <div className="w-8 h-8 rounded-lg bg-[#E5E5E0] flex items-center justify-center text-[#999]">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#888]">Publier une annonce</p>
                                    <p className="text-[10px] text-[#AAA]">Annonce active en cours</p>
                                </div>
                            </div>
                        ) : (
                            <ActionCard to="/annonces/create" label="Publier une annonce" desc="Proposer un nouveau trajet" color="#00854B"
                                icon={<path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />}
                            />
                        )}
                        <ActionCard to="/mes-passagers" label="Mes passagers"
                            desc={enAttente.length > 0 ? `${enAttente.length} en attente de réponse` : 'Gérer les demandes'}
                            color="#059154" badge={enAttente.length > 0 ? enAttente.length : null}
                            icon={<><circle cx="7" cy="4.5" r="2.5" stroke="white" strokeWidth="1.4" /><path d="M2 12c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="white" strokeWidth="1.4" strokeLinecap="round" /></>}
                        />
                        <ActionCard to="/mes-annonces" label="Mes annonces" desc="Consulter et gérer vos trajets" color="#3A6A4F"
                            icon={<><rect x="2" y="2" width="10" height="10" rx="2" stroke="white" strokeWidth="1.4" /><path d="M4.5 7h5M4.5 5h5M4.5 9h3" stroke="white" strokeWidth="1.4" strokeLinecap="round" /></>}
                        />
                    </div>
                </section>

                {/* Annonces actives récentes */}
                {!loading && actives.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-display font-bold text-[#111713]">Annonces actives</h2>
                            <Link to="/mes-annonces" className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-[color] duration-150">
                                Voir tout
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {actives.slice(0, 3).map(a => <AnnonceRow key={a.id} annonce={a} />)}
                        </div>
                    </section>
                )}

                {/* Empty state */}
                {!loading && actives.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-[rgba(0,0,0,0.07)]">
                        <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4 text-brand-600">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M4 17L5.5 13.5H18.5L20 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <rect x="3" y="16.5" width="18" height="3.5" rx="1.75" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="7" cy="20.5" r="1.5" fill="currentColor" />
                                <circle cx="17" cy="20.5" r="1.5" fill="currentColor" />
                                <path d="M8 13.5L10 9H14L16 13.5H8Z" fill="currentColor" fillOpacity="0.3" />
                            </svg>
                        </div>
                        <p className="text-[#1A1A1A] font-semibold text-lg mb-1">Aucun trajet actif</p>
                        <p className="text-[#888] text-sm mb-6">Publiez votre premier trajet et trouvez des passagers.</p>
                        <Link to="/annonces/create"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 active:scale-[0.97] transition-[background-color,transform] duration-150 shadow-[0_2px_8px_rgba(0,133,75,0.35)]"
                        >
                            Publier une annonce
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

function ActionCard({ to, label, desc, color, icon, badge }) {
    return (
        <Link to={to} className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-[opacity,transform] duration-150"
            style={{ background: color }}>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">{icon}</svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">{label}</p>
                <p className="text-[10px] text-white/70 truncate">{desc}</p>
            </div>
            {badge && (
                <span className="min-w-[18px] h-[18px] rounded-full bg-white/25 text-white text-[9px] font-bold flex items-center justify-center px-1">
                    {badge}
                </span>
            )}
        </Link>
    )
}

function AnnonceRow({ annonce }) {
    const statusLabel = { PUBLIEE: 'Active', COMPLETE: 'Complète', TERMINEE: 'Terminée' }
    const statusCls = {
        PUBLIEE: 'bg-brand-50 text-brand-700 border-brand-200',
        COMPLETE: 'bg-amber-50 text-amber-700 border-amber-200',
        TERMINEE: 'bg-stone-100 text-stone-500 border-stone-200',
    }
    return (
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.07)] px-5 py-4 flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
                <p className="font-semibold text-sm text-[#111713] truncate">
                    {annonce.villeDepart ?? '—'} → {annonce.villeArrivee ?? '—'}
                </p>
                <p className="text-xs text-[#888]">
                    {annonce.dateDepart} · {annonce.heureDepart?.slice(0, 5)} · {annonce.placesDisponibles} place{annonce.placesDisponibles !== 1 ? 's' : ''}
                </p>
            </div>
            <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusCls[annonce.statut] ?? statusCls.TERMINEE}`}>
                {statusLabel[annonce.statut] ?? annonce.statut}
            </span>
        </div>
    )
}

function StatCard({ value, label, accent, icon }) {
    return (
        <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${accent}18`, color: accent }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">{icon}</svg>
            </div>
            <p className="text-3xl font-display font-bold text-[#111713] leading-tight">{value}</p>
            <p className="text-[11px] text-[#8AA899] font-medium mt-0.5 uppercase tracking-wide">{label}</p>
        </div>
    )
}
