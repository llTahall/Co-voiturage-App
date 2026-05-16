import { useEffect, useState } from 'react'
import { getMesPassagers, accepterReservation, refuserReservation } from '../../api/reservationAPI'
import { useNotifications } from '../../context/NotificationContext'
import EvaluationModal from '../../components/EvaluationModal'

const statusConfig = {
    EN_ATTENTE: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    ACCEPTEE: { label: 'Acceptée', cls: 'bg-brand-50 text-brand-700 border-brand-200' },
    REFUSEE_CONDUCTEUR: { label: 'Refusée', cls: 'bg-red-50 text-red-600 border-red-200' },
    ANNULEE_PASSAGER: { label: 'Annulée (passager)', cls: 'bg-stone-100 text-stone-500 border-stone-200' },
    ANNULEE_CONDUCTEUR: { label: 'Annulée', cls: 'bg-stone-100 text-stone-500 border-stone-200' },
}

const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })
    : '—'

export default function MesPassagersPage() {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('en_attente')
    const [evalTarget, setEvalTarget] = useState(null)

    const { notifications } = useNotifications()

    const load = () => getMesPassagers()
        .then(({ data }) => setReservations(data))
        .finally(() => setLoading(false))

    useEffect(() => { load() }, [])

    useEffect(() => {
        const latest = notifications[0]
        if (latest?.type === 'NOUVELLE_RESERVATION' || latest?.type === 'RESERVATION_ANNULEE_PASSAGER') load()
    }, [notifications.length])

    const handleAccepter = async (id) => { await accepterReservation(id); load() }
    const handleRefuser = async (id) => { await refuserReservation(id); load() }

    const enAttente = reservations.filter(r =>
        r.statut === 'EN_ATTENTE' &&
        r.annonce?.statut !== 'TERMINEE' && r.annonce?.statut !== 'ANNULEE'
    )
    const actives = reservations.filter(r =>
        r.statut === 'ACCEPTEE' &&
        r.annonce?.statut !== 'TERMINEE' && r.annonce?.statut !== 'ANNULEE'
    )
    const historique = reservations.filter(r =>
        !['EN_ATTENTE', 'ACCEPTEE'].includes(r.statut) ||
        r.annonce?.statut === 'TERMINEE' || r.annonce?.statut === 'ANNULEE'
    )


    const tabs = [
        { key: 'en_attente', label: `À traiter (${enAttente.length})` },
        { key: 'actives', label: `Acceptées (${actives.length})` },
        { key: 'historique', label: 'Historique' },
    ]

    const displayed = tab === 'en_attente' ? enAttente : tab === 'actives' ? actives : historique

    return (
        <div className="min-h-screen pt-[68px] bg-[#F4F4F4]">
            <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

                <div>
                    <h1 className="text-[2.2rem] font-display font-bold text-[#1A1A1A]">Mes passagers</h1>
                    <p className="text-[#666] mt-1 text-sm">Gérez les demandes de réservation pour vos trajets.</p>
                </div>

                {enAttente.length > 0 && tab !== 'en_attente' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 font-medium">
                        {enAttente.length} demande{enAttente.length > 1 ? 's' : ''} en attente de votre réponse.
                    </div>
                )}

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-[rgba(0,0,0,0.07)] w-fit shadow-card">
                    {tabs.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-[background-color,color] duration-150 ${tab === key ? 'bg-brand-600 text-white shadow-brand' : 'text-[#666] hover:text-[#1A1A1A]'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center gap-3 text-[#666] text-sm">
                        <div className="w-4 h-4 rounded-full border-2 border-brand-300 border-t-brand-600 animate-spin" />
                        Chargement…
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-[rgba(0,0,0,0.07)]">
                        <p className="text-[#1A1A1A] font-semibold text-lg mb-1">Aucune demande</p>
                        <p className="text-[#888] text-sm">
                            {tab === 'en_attente' ? 'Aucune demande en attente.' : 'Rien dans cette catégorie.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayed.map(r => (
                            <PassagerCard
                                key={r.id}
                                r={r}
                                onAccepter={handleAccepter}
                                onRefuser={handleRefuser}
                                onEvaluer={setEvalTarget}
                            />
                        ))}
                    </div>
                )}
            </div>

            {evalTarget && (
                <EvaluationModal
                    reservation={evalTarget}
                    destinataireId={evalTarget.passager?.id}
                    destinataireName={`${evalTarget.passager?.prenom ?? ''} ${evalTarget.passager?.nom ?? ''}`}
                    onClose={() => setEvalTarget(null)}
                    onDone={() => { setEvalTarget(null); load() }}
                />
            )}
        </div>
    )
}

function PassagerCard({ r, onAccepter, onRefuser, onEvaluer }) {
    const [loadingA, setLoadingA] = useState(false)
    const [loadingR, setLoadingR] = useState(false)
    const status = statusConfig[r.statut] ?? statusConfig.ANNULEE_CONDUCTEUR
    const canEvaluate = r.statut === 'ACCEPTEE' && r.annonce?.statut === 'TERMINEE' && !r.hasEvaluated

    const handleAccepter = async () => {
        setLoadingA(true)
        await onAccepter(r.id)
        setLoadingA(false)
    }
    const handleRefuser = async () => {
        setLoadingR(true)
        await onRefuser(r.id)
        setLoadingR(false)
    }

    return (
        <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] shadow-card overflow-hidden">
            {/* Trajet header */}
            <div className="px-5 pt-4 pb-3 border-b border-[rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2 font-display font-bold text-base text-[#1A1A1A]">
                    <span>{r.annonce?.trajet?.villeDepart ?? '—'}</span>
                    <svg width="14" height="9" viewBox="0 0 14 9" fill="none" className="text-brand-500 shrink-0">
                        <path d="M1 4.5h11M8 1l3.5 3.5L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{r.annonce?.trajet?.villeArrivee ?? '—'}</span>
                    <span className="ml-auto text-[12px] font-normal text-[#888]">
                        {formatDate(r.annonce?.dateDepart)}
                        {r.annonce?.heureDepart && ` · ${r.annonce.heureDepart.slice(0, 5)}`}
                    </span>
                </div>
            </div>

            <div className="p-5 flex items-center justify-between gap-4">
                {/* Passager info */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-[13px] font-bold text-brand-700 uppercase shrink-0">
                        {r.passager?.prenom?.charAt(0)}{r.passager?.nom?.charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold text-[#1A1A1A] text-sm">
                            {r.passager?.prenom} {r.passager?.nom}
                        </p>
                        <p className="text-xs text-[#888] mt-0.5">
                            {r.nombrePlaces} place{r.nombrePlaces > 1 ? 's' : ''}
                            <span className="mx-1.5 text-[#C8D9D0]">·</span>
                            {r.annonce?.prixParPlace && r.nombrePlaces
                                ? `${(r.annonce.prixParPlace * r.nombrePlaces).toFixed(0)} MAD`
                                : '—'}
                        </p>
                        {r.passager?.telephone && (
                            <a
                                href={`tel:${r.passager.telephone}`}
                                className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-[color] duration-150"
                            >
                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                    <path d="M2 1h2.5l1 2.5-1.5 1a6 6 0 003.5 3.5l1-1.5L11 7.5V10a1 1 0 01-1 1C4.477 11 0 6.523 0 1a1 1 0 011-1h1z" fill="currentColor" />
                                </svg>
                                {r.passager.telephone}
                            </a>
                        )}
                    </div>
                </div>


                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {r.statut === 'EN_ATTENTE' ? (
                        <>
                            <button
                                onClick={handleRefuser} disabled={loadingR}
                                className="px-4 py-2 rounded-xl border border-[rgba(0,0,0,0.1)] text-sm font-semibold text-[#666] hover:border-red-300 hover:text-red-500 active:scale-[0.96] transition-[border-color,color,transform] duration-150 disabled:opacity-50"
                            >
                                {loadingR ? '…' : 'Refuser'}
                            </button>
                            <button
                                onClick={handleAccepter} disabled={loadingA}
                                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 active:scale-[0.96] transition-[background-color,transform] duration-150 disabled:opacity-50 shadow-brand"
                            >
                                {loadingA ? '…' : 'Accepter'}
                            </button>
                        </>
                    ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${status.cls}`}>
                            {status.label}
                        </span>
                    )}
                </div>
            </div>

            {/* Évaluation banner */}
            {canEvaluate && (
                <div className="px-5 py-3 border-t border-[rgba(0,0,0,0.06)] bg-brand-50/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-brand-600 shrink-0">
                            <path d="M7 1.5L8.5 5H12.5L9.2 7.3L10.5 11.5L7 9.1L3.5 11.5L4.8 7.3L1.5 5H5.5L7 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                        </svg>
                        <span className="text-xs font-semibold text-brand-700">Trajet terminé — évaluez ce passager</span>
                    </div>
                    <button
                        onClick={() => onEvaluer(r)}
                        className="px-4 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 active:scale-[0.96] transition-[background-color,transform] duration-150"
                        style={{ boxShadow: '0 2px 8px rgba(0,133,75,0.25)' }}
                    >
                        Évaluer
                    </button>
                </div>
            )}

            {r.hasEvaluated && r.annonce?.statut === 'TERMINEE' && (
                <div className="px-5 py-2.5 border-t border-[rgba(0,0,0,0.06)] flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-brand-500 shrink-0">
                        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M3.5 6l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[11px] text-brand-600 font-semibold">Avis envoyé</span>
                </div>
            )}
        </div>
    )
}
