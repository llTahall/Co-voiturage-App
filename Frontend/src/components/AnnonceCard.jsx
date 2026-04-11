import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createReservation } from '../api/reservationAPI'

export default function AnnonceCard({ annonce, onReserved }) {
  const { isAuthenticated } = useAuth()
  const [places, setPlaces] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleReserver = async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setError('')
    try {
      await createReservation({ annonceId: annonce.id, nombrePlaces: places })
      onReserved?.()
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de la réservation')
    } finally {
      setLoading(false)
    }
  }

  const date = new Date(annonce.dateDepart).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long'
  })

  return (
    <article className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col gap-4
      hover:border-brand-300 hover:shadow-[0_4px_24px_rgba(9,163,90,0.08)]
      transition-[border-color,box-shadow] duration-300">

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-display">
            <span>{annonce.trajet?.villeDepart}</span>
            <span className="text-brand-500">→</span>
            <span>{annonce.trajet?.villeArrivee}</span>
          </div>
          <p className="text-sm text-stone-500 mt-0.5">
            {date} · {annonce.heureDepart?.slice(0, 5)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-semibold text-brand-600">{annonce.prixParPlace}€</p>
          <p className="text-xs text-stone-400">/ place</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-stone-500">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          annonce.statut === 'PUBLIEE' ? 'bg-brand-50 text-brand-700' :
          annonce.statut === 'COMPLETE' ? 'bg-amber-50 text-amber-700' :
          'bg-stone-100 text-stone-500'
        }`}>
          {annonce.statut}
        </span>
        <span>{annonce.placesDisponibles} place{annonce.placesDisponibles > 1 ? 's' : ''} dispo.</span>
        <span>·</span>
        <span>{annonce.conducteur?.prenom} {annonce.conducteur?.nom?.charAt(0)}.</span>
      </div>

      {annonce.vehicule && (
        <p className="text-sm text-stone-400">
          {annonce.vehicule.couleur} · {annonce.vehicule.marque} {annonce.vehicule.modele}
        </p>
      )}

      {isAuthenticated && annonce.statut === 'PUBLIEE' && (
        <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
          <input
            type="number" min={1} max={annonce.placesDisponibles} value={places}
            onChange={e => setPlaces(Number(e.target.value))}
            className="w-16 rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-center focus:outline-none focus:border-brand-400"
          />
          <button
            onClick={handleReserver}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium
              hover:bg-brand-700 active:scale-[0.98] transition-[transform,background-color] duration-150
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Réservation…' : 'Réserver'}
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </article>
  )
}
