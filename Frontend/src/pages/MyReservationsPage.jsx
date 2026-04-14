import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { getMesReservations, annulerReservation } from '../api/reservationAPI'

const statusConfig = {
  EN_ATTENTE: { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  ACCEPTEE: { label: 'Acceptée', cls: 'bg-brand-50 text-brand-700 border-brand-200' },
  REFUSEE_CONDUCTEUR: { label: 'Refusée (conducteur)', cls: 'bg-red-50 text-red-600 border-red-200' },
  ANNULEE_PASSAGER: { label: 'Annulée par vous', cls: 'bg-stone-100 text-stone-500 border-stone-200' },
  ANNULEE_CONDUCTEUR: { label: 'Annulée (conducteur)', cls: 'bg-red-50 text-red-600 border-red-200' },
}

const ACTIVE_STATUTS = ['EN_ATTENTE', 'ACCEPTEE']

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('actives')
  const [filterStatus, setFilterStatus] = useState('TOUS')
  const location = useLocation()
  const justReserved = location.state?.justReserved

  const load = () => getMesReservations()
    .then(({ data }) => setReservations(data))
    .finally(() => setLoading(false))

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleAnnuler = async (id) => {
    await annulerReservation(id)
    load()
  }

  const active = reservations.filter(r => ACTIVE_STATUTS.includes(r.statut))
  const historyAll = reservations.filter(r => !ACTIVE_STATUTS.includes(r.statut))
  const history = filterStatus === 'TOUS' ? historyAll : historyAll.filter(r => r.statut === filterStatus)

  const displayed = tab === 'actives' ? active : history

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    : '—'

  return (
    <div className="min-h-screen pt-[68px] bg-[#F4F4F4]">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

        {justReserved && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4 anim-fade-up">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="1.5" />
                <path d="M9 5v4l2.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-amber-800">Demande envoyée !</p>
              <p className="text-sm text-amber-700 mt-0.5">Le conducteur doit encore accepter votre demande.</p>
            </div>
          </div>
        )}

        <div>
          <h1 className="text-[2.2rem] font-display font-bold text-[#1A1A1A]">Mes réservations</h1>
          <p className="text-[#666] mt-1 text-sm">Consultez et gérez vos trajets.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-[rgba(0,0,0,0.07)] w-fit shadow-card">
          {[
            { key: 'actives', label: `Actives (${active.length})` },
            { key: 'historique', label: 'Historique' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setFilterStatus('TOUS') }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-[background-color,color] duration-150 ${tab === key ? 'bg-brand-600 text-white shadow-brand' : 'text-[#666] hover:text-[#1A1A1A]'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filtres historique */}
        {tab === 'historique' && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#888] uppercase tracking-wide">Filtrer :</span>
            {[
              { key: 'TOUS', label: 'Tous', cls: 'bg-stone-100 text-stone-600 border-stone-200' },
              { key: 'REFUSEE_CONDUCTEUR', label: 'Refusées', cls: statusConfig.REFUSEE_CONDUCTEUR.cls },
              { key: 'ANNULEE_PASSAGER', label: 'Annulées par vous', cls: statusConfig.ANNULEE_PASSAGER.cls },
              { key: 'ANNULEE_CONDUCTEUR', label: 'Annulées (conducteur)', cls: statusConfig.ANNULEE_CONDUCTEUR.cls },
            ].map(({ key, label, cls }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-[opacity] duration-150 ${cls} ${filterStatus === key ? 'opacity-100 ring-2 ring-offset-1 ring-brand-400' : 'opacity-60 hover:opacity-100'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 text-[#666] text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-brand-300 border-t-brand-600 animate-spin" />
            Chargement…
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[rgba(0,0,0,0.07)]">
            <p className="text-[#1A1A1A] font-semibold text-lg mb-1">
              {tab === 'actives' ? 'Aucune réservation active' : "Aucune réservation dans l'historique"}
            </p>
            <p className="text-[#888] text-sm mb-6">
              {tab === 'actives' ? 'Trouvez un trajet et faites une demande.' : 'Modifiez le filtre pour voir plus de résultats.'}
            </p>
            {tab === 'actives' && (
              <Link to="/search" className="inline-flex px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition-[background-color] duration-150 shadow-brand">
                Rechercher un trajet
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map(r => (
              <ReservationCard key={r.id} r={r} onAnnuler={handleAnnuler} formatDate={formatDate} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ReservationCard({ r, onAnnuler, formatDate }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[r.statut] ?? statusConfig.ANNULEE_CONDUCTEUR
  const isActive = ACTIVE_STATUTS.includes(r.statut)
  const isAcceptee = r.statut === 'ACCEPTEE'
  const total = r.annonce?.prixParPlace && r.nombrePlaces
    ? (r.annonce.prixParPlace * r.nombrePlaces).toFixed(0)
    : '—'

  const villeDepart = r.annonce?.trajet?.villeDepart ?? '—'
  const villeArrivee = r.annonce?.trajet?.villeArrivee ?? '—'
  const conducteur = r.annonce?.conducteur

  return (
    <div className={`bg-white rounded-2xl border shadow-card overflow-hidden ${isActive ? 'border-brand-300 ring-1 ring-brand-200' : 'border-[rgba(0,0,0,0.07)]'
      }`}>
      {r.statut === 'EN_ATTENTE' && (
        <div className="bg-amber-500 px-5 py-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-white text-xs font-semibold tracking-wide uppercase">En attente d'acceptation</span>
        </div>
      )}
      {r.statut === 'ACCEPTEE' && (
        <div className="bg-brand-600 px-5 py-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-white text-xs font-semibold tracking-wide uppercase">Réservation acceptée</span>
        </div>
      )}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 font-display font-bold text-lg text-[#1A1A1A]">
            <span className="truncate">{villeDepart}</span>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="shrink-0 text-brand-500">
              <path d="M1 5h13M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="truncate">{villeArrivee}</span>
          </div>
          <p className="text-sm text-[#666]">
            {formatDate(r.annonce?.dateDepart)}
            {r.annonce?.heureDepart && <> · {r.annonce.heureDepart.slice(0, 5)}</>}
            <span className="mx-1.5 text-[#C8D9D0]">·</span>
            {r.nombrePlaces} place{r.nombrePlaces > 1 ? 's' : ''}
          </p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${status.cls}`}>
            {status.label}
          </span>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-display font-bold text-brand-600 leading-tight">{total}</p>
          <p className="text-[10px] text-[#8AA899] font-medium uppercase tracking-wide mt-0.5">MAD total</p>
          {isActive && (
            <button
              onClick={() => onAnnuler(r.id)}
              className="mt-3 text-xs text-[#AAA] hover:text-red-500 transition-[color] duration-150 font-medium block"
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* Détails conducteur — visible uniquement si ACCEPTÉE */}
      {isAcceptee && (
        <>
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full px-5 py-2.5 border-t border-[rgba(0,0,0,0.06)] text-xs font-semibold text-[#666] hover:text-brand-700 hover:bg-brand-50 transition-[color,background-color] duration-150 flex items-center justify-center gap-1.5"
          >
            {expanded ? 'Masquer les détails' : 'Voir les détails du trajet'}
            <svg
              width="10" height="10" viewBox="0 0 10 10" fill="none"
              className={`transition-[transform] duration-200 ${expanded ? 'rotate-180' : ''}`}
            >
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {expanded && (
            <div className="px-5 pb-5 space-y-4 border-t border-[rgba(0,0,0,0.06)] pt-4">
              {/* Infos trajet */}
              <div className="flex gap-3">
                {r.annonce?.trajet?.distanceTotale != null && (
                  <div className="flex-1 bg-[#F9F9F7] rounded-xl p-3 text-center">
                    <p className="text-[11px] text-[#8AA899] uppercase tracking-wide font-semibold">Distance</p>
                    <p className="font-bold text-[#333] mt-0.5">{r.annonce.trajet.distanceTotale} km</p>
                  </div>
                )}
                {r.annonce?.trajet?.dureeEstimeeTotale != null && (
                  <div className="flex-1 bg-[#F9F9F7] rounded-xl p-3 text-center">
                    <p className="text-[11px] text-[#8AA899] uppercase tracking-wide font-semibold">Durée</p>
                    <p className="font-bold text-[#333] mt-0.5">
                      {Math.floor(r.annonce.trajet.dureeEstimeeTotale / 60)}h
                      {(r.annonce.trajet.dureeEstimeeTotale % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                )}
                <div className="flex-1 bg-[#F9F9F7] rounded-xl p-3 text-center">
                  <p className="text-[11px] text-[#8AA899] uppercase tracking-wide font-semibold">Prix/place</p>
                  <p className="font-bold text-brand-600 mt-0.5">{r.annonce?.prixParPlace} MAD</p>
                </div>
              </div>

              {/* Profil conducteur */}
              {conducteur && (
                <div className="flex items-center gap-3 bg-[#F9F9F7] rounded-xl p-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-[13px] font-bold text-brand-700 uppercase shrink-0">
                    {conducteur.prenom?.charAt(0)}{conducteur.nom?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#333]">
                      {conducteur.prenom} {conducteur.nom?.charAt(0)}.
                    </p>
                    <p className="text-[11px] text-[#8AA899]">Conducteur</p>
                  </div>
                  {conducteur.telephone && (
                    <a
                      href={`tel:${conducteur.telephone}`}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-[11px] font-bold hover:bg-brand-700 transition-[background-color] duration-150"
                    >
                      Appeler
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

