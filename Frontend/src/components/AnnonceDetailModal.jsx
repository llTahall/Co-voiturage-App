import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { createReservation, getMesPassagers, accepterReservation, refuserReservation } from '../api/reservationAPI'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length >= 2) map.fitBounds(positions, { padding: [40, 40] })
  }, [map, positions])
  return null
}

const statusRes = {
  EN_ATTENTE: { label: 'En attente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  ACCEPTEE: { label: 'Acceptée', className: 'bg-brand-50 text-brand-700 border-brand-200' },
  REFUSEE_CONDUCTEUR: { label: 'Refusée', className: 'bg-red-50 text-red-600 border-red-200' },
  ANNULEE_PASSAGER: { label: 'Annulée', className: 'bg-stone-100 text-stone-500 border-stone-200' },
  ANNULEE_CONDUCTEUR: { label: 'Annulée', className: 'bg-stone-100 text-stone-500 border-stone-200' },
}

export default function AnnonceDetailModal({ annonce, onClose, onReserved }) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('details')
  const [passagers, setPassagers] = useState([])
  const [loadingPass, setLoadingPass] = useState(false)
  const [places, setPlaces] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isConducteur = user?.role === 'CONDUCTEUR'
  const isMyAnnonce = annonce.conducteur?.id === user?.id
  const canReserve = isAuthenticated && !isConducteur && !isMyAnnonce

  const t = annonce.trajet
  const etapes = t?.etapes ? [...t.etapes].sort((a, b) => a.ordre - b.ordre) : []
  const positions = etapes.filter(e => e.latitude && e.longitude).map(e => [e.latitude, e.longitude])
  const hasMap = positions.length >= 2

  useEffect(() => {
    if (tab === 'passagers' && isMyAnnonce) {
      setLoadingPass(true)
      getMesPassagers()
        .then(({ data }) => setPassagers(data.filter(r => r.annonce?.id === annonce.id)))
        .catch(() => { })
        .finally(() => setLoadingPass(false))
    }
  }, [tab, isMyAnnonce, annonce.id])

  const handleReserver = async () => {
    setLoading(true)
    setError('')
    try {
      await createReservation({ annonceId: annonce.id, nombrePlaces: places })
      onReserved?.()
      onClose()
      navigate('/mes-reservations', { state: { justReserved: true } })
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de la réservation')
    } finally {
      setLoading(false)
    }
  }

  const handleAccepter = async (id) => {
    await accepterReservation(id)
    setPassagers(p => p.map(r => r.id === id ? { ...r, statut: 'ACCEPTEE' } : r))
  }

  const handleRefuser = async (id) => {
    await refuserReservation(id)
    setPassagers(p => p.map(r => r.id === id ? { ...r, statut: 'REFUSEE_CONDUCTEUR' } : r))
  }

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[rgba(0,0,0,0.07)]">
          <div>
            <h2 className="font-display font-bold text-[1.1rem] text-[#1A1A1A]">
              {etapes[0]?.ville ?? '—'} → {etapes[etapes.length - 1]?.ville ?? '—'}
            </h2>
            <p className="text-[13px] text-[#666] mt-0.5">
              {annonce.dateDepart
                ? new Date(annonce.dateDepart).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
                : '—'}{' '}
              · {annonce.heureDepart?.slice(0, 5) ?? '—'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#666] hover:bg-[#F0F0EC] transition-[background-color] duration-150"
          >
            ✕
          </button>
        </div>

        {/* Tabs — conducteur de sa propre annonce seulement */}
        {isMyAnnonce && (
          <div className="flex border-b border-[rgba(0,0,0,0.07)]">
            {['details', 'passagers'].map(t2 => (
              <button
                key={t2}
                onClick={() => setTab(t2)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-[color,border-color] duration-150 border-b-2 ${tab === t2
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-[#666] hover:text-[#333]'
                  }`}
              >
                {t2 === 'details' ? 'Détails' : 'Passagers'}
              </button>
            ))}
          </div>
        )}

        {tab === 'details' ? (
          <div className="p-5 space-y-4">
            {/* Étapes */}
            <div>
              <p className="text-[11px] font-semibold text-[#8AA899] uppercase tracking-wide mb-2">Itinéraire</p>
              <div className="space-y-1">
                {etapes.map((e, i) => (
                  <div key={e.id ?? i} className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${i === 0 ? 'bg-brand-600' : i === etapes.length - 1 ? 'bg-[#333]' : 'bg-[#C8D9D0]'
                      }`} />
                    <span className="text-[13px] text-[#333]">{e.ville}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Infos trajet */}
            {t && (
              <div className="flex gap-3">
                {t.distanceKm != null && (
                  <div className="flex-1 bg-[#F9F9F7] rounded-xl p-3 text-center">
                    <p className="text-[11px] text-[#8AA899] uppercase tracking-wide font-semibold">Distance</p>
                    <p className="font-bold text-[#333] mt-0.5">{t.distanceKm} km</p>
                  </div>
                )}
                {t.dureeEstimeeTotale != null && (
                  <div className="flex-1 bg-[#F9F9F7] rounded-xl p-3 text-center">
                    <p className="text-[11px] text-[#8AA899] uppercase tracking-wide font-semibold">Durée</p>
                    <p className="font-bold text-[#333] mt-0.5">
                      {Math.floor(t.dureeEstimeeTotale / 60)}h{(t.dureeEstimeeTotale % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                )}
                <div className="flex-1 bg-[#F9F9F7] rounded-xl p-3 text-center">
                  <p className="text-[11px] text-[#8AA899] uppercase tracking-wide font-semibold">Prix</p>
                  <p className="font-bold text-brand-600 mt-0.5">{annonce.prixParPlace} MAD</p>
                </div>
              </div>
            )}

            {/* Carte */}
            {hasMap && (
              <div className="rounded-xl overflow-hidden h-48 border border-[rgba(0,0,0,0.07)]">
                <MapContainer
                  center={positions[0]}
                  zoom={7}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Polyline positions={positions} color="#00854B" weight={3} />
                  {etapes.filter(e => e.latitude && e.longitude).map((e, i) => (
                    <Marker key={i} position={[e.latitude, e.longitude]}>
                      <Popup>{e.ville}</Popup>
                    </Marker>
                  ))}
                  <FitBounds positions={positions} />
                </MapContainer>
              </div>
            )}

            {/* Véhicule */}
            {annonce.vehicule && (
              <div className="bg-[#F9F9F7] rounded-xl p-3">
                <p className="text-[11px] font-semibold text-[#8AA899] uppercase tracking-wide mb-1">Véhicule</p>
                <p className="text-[13px] text-[#333]">
                  {annonce.vehicule.couleur} · {annonce.vehicule.marque} {annonce.vehicule.modele} · {annonce.vehicule.immatriculation}
                </p>
              </div>
            )}

            {/* Conducteur */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-[12px] font-bold text-brand-700 uppercase">
                {annonce.conducteur?.prenom?.charAt(0)}{annonce.conducteur?.nom?.charAt(0)}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#333]">
                  {annonce.conducteur?.prenom} {annonce.conducteur?.nom?.charAt(0)}.
                </p>
                <p className="text-[11px] text-[#8AA899]">Conducteur</p>
              </div>
            </div>

            {/* Réservation */}
            {canReserve && annonce.statut === 'PUBLIEE' && (
              <div className="border-t border-[rgba(0,0,0,0.06)] pt-4 flex items-center gap-3">
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
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        ) : (
          <div className="p-5">
            {loadingPass ? (
              <p className="text-sm text-[#666] text-center py-4">Chargement…</p>
            ) : passagers.length === 0 ? (
              <p className="text-sm text-[#666] text-center py-4">Aucune demande pour le moment</p>
            ) : (
              <div className="space-y-3">
                {passagers.map(r => {
                  const sc = statusRes[r.statut] ?? statusRes.EN_ATTENTE
                  return (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F9F9F7]">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-[11px] font-bold text-brand-700 uppercase shrink-0">
                        {r.passager?.prenom?.charAt(0)}{r.passager?.nom?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#333]">
                          {r.passager?.prenom} {r.passager?.nom?.charAt(0)}.
                        </p>
                        <p className="text-[11px] text-[#8AA899]">{r.nombrePlaces} place{r.nombrePlaces !== 1 ? 's' : ''}</p>
                      </div>
                      {r.statut === 'EN_ATTENTE' ? (
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => handleAccepter(r.id)}
                            className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-[11px] font-bold hover:bg-brand-700 transition-[background-color] duration-150"
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() => handleRefuser(r.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#F0F0EC] text-[#666] text-[11px] font-bold hover:bg-[#E5E5E0] transition-[background-color] duration-150"
                          >
                            Refuser
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sc.className}`}>
                          {sc.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
