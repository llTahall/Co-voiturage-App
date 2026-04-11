import { useEffect, useState } from 'react'
import { getMesReservations, annulerReservation } from '../api/reservationAPI'

const statusLabel = { CONFIRMEE: 'Confirmée', ANNULEE_PASSAGER: 'Annulée', ANNULEE_CONDUCTEUR: 'Annulée (conducteur)' }
const statusColor = {
  CONFIRMEE: 'bg-brand-50 text-brand-700',
  ANNULEE_PASSAGER: 'bg-red-50 text-red-600',
  ANNULEE_CONDUCTEUR: 'bg-amber-50 text-amber-700',
}

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => getMesReservations()
    .then(({ data }) => setReservations(data))
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleAnnuler = async (id) => {
    await annulerReservation(id)
    load()
  }

  return (
    <div className="min-h-screen pt-24 max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl mb-8">Mes réservations</h1>

      {loading ? (
        <p className="text-stone-400 text-sm">Chargement…</p>
      ) : reservations.length === 0 ? (
        <p className="text-stone-400 text-sm">Aucune réservation pour l'instant.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map(r => (
            <div key={r.id}
              className="bg-white rounded-2xl border border-stone-200 p-6 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-display text-lg">
                  {r.annonce?.trajet?.villeDepart}
                  <span className="text-brand-500 mx-2">→</span>
                  {r.annonce?.trajet?.villeArrivee}
                </div>
                <p className="text-sm text-stone-500">
                  {r.annonce?.dateDepart} · {r.annonce?.heureDepart?.slice(0, 5)} · {r.nombrePlaces} place{r.nombrePlaces > 1 ? 's' : ''}
                </p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[r.statut]}`}>
                  {statusLabel[r.statut]}
                </span>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-semibold text-brand-600">
                  {(r.annonce?.prixParPlace * r.nombrePlaces).toFixed(0)} DZD
                </p>
                {r.statut === 'CONFIRMEE' && (
                  <button onClick={() => handleAnnuler(r.id)}
                    className="mt-2 text-xs text-stone-400 hover:text-red-500 transition-colors duration-150">
                    Annuler
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
