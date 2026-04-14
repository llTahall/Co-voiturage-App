import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { createReservation } from '../api/reservationAPI'
import AnnonceDetailModal from './AnnonceDetailModal'

const statusConfig = {
  PUBLIEE: { label: 'Disponible', className: 'bg-brand-50 text-brand-700 border-brand-200' },
  COMPLETE: { label: 'Complet', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  ANNULEE: { label: 'Annulée', className: 'bg-stone-100 text-stone-500 border-stone-200' },
}

function getEtapesVilles(trajet) {
  const etapes = trajet?.etapes
  if (!etapes?.length) return { depart: '—', arrivee: '—' }
  const sorted = [...etapes].sort((a, b) => a.ordre - b.ordre)
  return { depart: sorted[0]?.ville ?? '—', arrivee: sorted[sorted.length - 1]?.ville ?? '—' }
}

export default function AnnonceCard({ annonce, onReserved, alreadyReserved, hasActiveReservation }) {
  const [showDetail, setShowDetail] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [places, setPlaces] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isConducteur = user?.role === 'CONDUCTEUR'
  const isMyAnnonce = annonce.conducteur?.id === user?.id
  const canReserve = isAuthenticated && !isConducteur && !isMyAnnonce

  const handleReserver = async () => {
    setLoading(true)
    setError('')
    try {
      await createReservation({ annonceId: annonce.id, nombrePlaces: places })
      onReserved?.()
      navigate('/mes-reservations', { state: { justReserved: true } })
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de la réservation')
    } finally {
      setLoading(false)
    }
  }

  const { depart, arrivee } = getEtapesVilles(annonce.trajet)
  const date = annonce.dateDepart
    ? new Date(annonce.dateDepart).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })
    : '—'
  const status = statusConfig[annonce.statut] ?? statusConfig.ANNULEE

  return (
    <article className="group bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-[transform,box-shadow] duration-300 overflow-hidden">
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 font-display font-bold text-[1.05rem] text-[#1A1A1A] leading-tight">
              <span className="truncate">{depart}</span>
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none" className="shrink-0 text-brand-500">
                <path d="M1 5h15M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="truncate">{arrivee}</span>
            </div>
            <p className="text-[13px] text-[#666] mt-1">
              {date} · {annonce.heureDepart?.slice(0, 5) ?? '—'}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[1.6rem] font-display font-bold leading-none text-brand-600">{annonce.prixParPlace ?? '—'}</p>
            <p className="text-[10px] text-[#8AA899] font-medium tracking-wide uppercase mt-0.5">MAD / place</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${status.className}`}>
            {status.label}
          </span>
          <span className="flex items-center gap-1 text-[13px] text-[#666]">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="4" r="2.3" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1.5 12C1.5 9.5 3.8 7.5 6.5 7.5C9.2 7.5 11.5 9.5 11.5 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {annonce.placesDisponibles} place{annonce.placesDisponibles !== 1 ? 's' : ''} dispo.
          </span>
          <span className="text-[#C8D9D0]">·</span>
          <span className="text-[13px] text-[#666]">
            {annonce.conducteur?.prenom} {annonce.conducteur?.nom?.charAt(0)}.
          </span>
        </div>

        {annonce.vehicule && (
          <div className="mt-3 flex items-center gap-1.5 text-[12px] text-[#8AA899]">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 8.5L3 6H10L11 8.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              <rect x="1.5" y="8" width="10" height="2.5" rx="1.25" stroke="currentColor" strokeWidth="1.1" />
              <circle cx="3.5" cy="10.5" r="0.9" fill="currentColor" />
              <circle cx="9.5" cy="10.5" r="0.9" fill="currentColor" />
            </svg>
            {annonce.vehicule.couleur} · {annonce.vehicule.marque} {annonce.vehicule.modele}
          </div>
        )}
      </div>

      {/* Section réservation — passagers uniquement, pas sa propre annonce */}
      {canReserve && annonce.statut === 'PUBLIEE' && (
        <div className="border-t border-[rgba(0,0,0,0.06)] bg-[#F9F9F7] px-5 py-3.5 flex items-center gap-3">
          {alreadyReserved ? (
            <div className="w-full py-2.5 rounded-xl bg-brand-50 border border-brand-200 text-center text-sm font-semibold text-brand-700">
              ✓ Demande envoyée
            </div>
          ) : hasActiveReservation ? (
            <div className="w-full py-2.5 rounded-xl bg-[#F0F0EC] text-center text-sm font-medium text-[#8AA899]">
              Trajet actif en cours — annulez-le d'abord
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-[#8AA899] uppercase tracking-wide">Places</label>
                <input
                  type="number" min={1} max={annonce.placesDisponibles} value={places}
                  onChange={e => setPlaces(Number(e.target.value))}
                  className="w-14 rounded-lg border border-[rgba(0,0,0,0.1)] px-2.5 py-1.5 text-sm text-center focus:outline-none focus:border-brand-400 bg-white"
                />
              </div>
              <button
                onClick={handleReserver} disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 active:scale-[0.97] transition-[background-color,transform] duration-150 disabled:opacity-50 shadow-brand"
              >
                {loading ? 'Envoi…' : 'Demander une place'}
              </button>
            </>
          )}
        </div>
      )}

      {error && <p className="px-5 pb-3 text-xs text-red-500">{error}</p>}

      <button
        onClick={() => setShowDetail(true)}
        className="w-full py-2 text-xs font-semibold text-[#666] hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-[color,background-color] duration-150"
      >
        Voir le trajet complet →
      </button>

      {showDetail && (
        <AnnonceDetailModal annonce={annonce} onClose={() => setShowDetail(false)} onReserved={onReserved} />
      )}
    </article>
  )
}
