import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { createAnnonce, getMesAnnonces } from '../api/annonceAPI'
import { getMesVehicules, createVehicule } from '../api/vehiculeAPI'
import MapPicker from '../components/MapPicker'

async function calculateRoute(etapes) {
  const valid = etapes.filter(e => e.lat && e.lon)
  if (valid.length < 2) return null
  const coords = valid.map(e => `${e.lon},${e.lat}`).join(';')
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`)
    const json = await res.json()
    if (json.code === 'Ok') {
      return {
        distanceKm: Math.round(json.routes[0].distance / 1000),
        dureeMins: Math.round(json.routes[0].duration / 60),
      }
    }
  } catch { /* réseau indisponible, pas bloquant */ }
  return null
}

const emptyEtape = () => ({ ville: '', adresse: '', lat: null, lon: null })

export default function CreateAnnoncePage() {
  const navigate = useNavigate()
  const [hasActive, setHasActive] = useState(null) // null = chargement
  const [vehicules, setVehicules] = useState([])
  const [etapes, setEtapes] = useState([emptyEtape(), emptyEtape()])
  const [form, setForm] = useState({
    vehiculeId: '',
    dateDepart: '',
    heureDepart: '',
    placesTotal: 3,
    prixParPlace: '',
    distanceTotale: '',
    dureeEstimeeTotale: '',
  })
  const [newVehicule, setNewVehicule] = useState({ marque: '', modele: '', couleur: '', immatriculation: '' })
  const [showAddVehicule, setShowAddVehicule] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getMesAnnonces().then(({ data }) => {
      setHasActive(data.some(a => ['PUBLIEE', 'COMPLETE'].includes(a.statut)))

    })
    getMesVehicules().then(({ data }) => setVehicules(data))
  }, [])

  // Garde — conducteur déjà une annonce active
  if (hasActive === true) return <Navigate to="/mes-annonces" replace />
  if (hasActive === null) return (
    <div className="min-h-screen pt-[68px] flex items-center justify-center bg-[#F7F7F4]">
      <div className="w-5 h-5 rounded-full border-2 border-brand-300 border-t-brand-600 animate-spin" />
    </div>
  )

  const updateEtape = async (index, value) => {
    const newEtapes = etapes.map((e, i) => i === index ? value : e)
    setEtapes(newEtapes)
    if (newEtapes.every(e => e.lat && e.lon)) {
      const result = await calculateRoute(newEtapes)
      if (result) {
        setForm(f => ({
          ...f,
          distanceTotale: String(result.distanceKm),
          dureeEstimeeTotale: String(result.dureeMins),
        }))
      }
    }
  }

  const addEtape = () => {
    setEtapes(prev => [...prev.slice(0, -1), emptyEtape(), prev[prev.length - 1]])
  }

  const removeEtape = async (index) => {
    const newEtapes = etapes.filter((_, i) => i !== index)
    setEtapes(newEtapes)
    if (newEtapes.length >= 2 && newEtapes.every(e => e.lat && e.lon)) {
      const result = await calculateRoute(newEtapes)
      if (result) {
        setForm(f => ({
          ...f,
          distanceTotale: String(result.distanceKm),
          dureeEstimeeTotale: String(result.dureeMins),
        }))
      }
    }
  }


  const handleAddVehicule = async () => {
    const { data } = await createVehicule(newVehicule)
    setVehicules(v => [...v, data])
    setForm(f => ({ ...f, vehiculeId: data.id }))
    setShowAddVehicule(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    for (let i = 0; i < etapes.length; i++) {
      if (!etapes[i].ville) {
        const label = i === 0 ? 'départ' : i === etapes.length - 1 ? 'destination' : `arrêt ${i}`
        setError(`Veuillez sélectionner le point de ${label} sur la carte.`)
        return
      }
    }
    if (!form.vehiculeId) {
      setError('Veuillez sélectionner ou ajouter un véhicule.')
      return
    }

    setLoading(true)
    try {
      await createAnnonce({
        vehiculeId: Number(form.vehiculeId),
        dateDepart: form.dateDepart,
        heureDepart: form.heureDepart,
        placesTotal: Number(form.placesTotal),
        prixParPlace: Number(form.prixParPlace),
        distanceTotale: form.distanceTotale ? Number(form.distanceTotale) : null,
        dureeEstimeeTotale: form.dureeEstimeeTotale ? Number(form.dureeEstimeeTotale) : null,
        etapes: etapes.map(e => ({
          ville: e.ville,
          adresse: e.adresse,
          latitude: e.lat,
          longitude: e.lon,
        })),
      })
      navigate('/mes-annonces')
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object' && !data.message) {
        setError(Object.values(data)[0] || 'Erreur lors de la publication')
      } else {
        setError(data?.message || 'Erreur lors de la publication')
      }
    } finally {
      setLoading(false)
    }
  }

  const etapeLabel = (i) => {
    if (i === 0) return 'Point de départ'
    if (i === etapes.length - 1) return 'Destination finale'
    return `Arrêt intermédiaire ${i}`
  }

  return (
    <div className="min-h-screen pt-[68px] bg-[#F7F7F4]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-[2.2rem] font-display font-bold text-[#111713]">Publier une annonce</h1>
          <p className="text-[#5A7265] mt-1.5">Renseignez votre trajet pour trouver des passagers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 mt-0.5">
                <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7.5 4.5V8M7.5 10.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          {/* Trajet */}
          <Card title="Trajet" icon={
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="3" cy="3.5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="11.5" r="1.5" fill="currentColor" />
              <path d="M3 5V8C3 9.5 4.5 11 6 11H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          }>
            <div className="space-y-4">
              {etapes.map((etape, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8AA899]">
                      {etapeLabel(i)}
                    </span>
                    {i > 0 && i < etapes.length - 1 && (
                      <button
                        type="button"
                        onClick={() => removeEtape(i)}
                        className="text-[11px] text-red-400 hover:text-red-600 font-semibold transition-[color] duration-150"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  <MapPicker value={etape} onChange={(v) => updateEtape(i, v)} />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addEtape}
              className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-[color] duration-150 mt-2"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Ajouter un arrêt intermédiaire
            </button>

            {/* Distance & durée — auto-calculées ou saisie manuelle */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[rgba(0,0,0,0.06)] mt-2">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1.5">
                  Distance totale (km)
                  {form.distanceTotale && <span className="ml-1 text-brand-500 normal-case tracking-normal">· calculée</span>}
                </label>
                <input
                  type="number" min="1" value={form.distanceTotale}
                  onChange={e => setForm(f => ({ ...f, distanceTotale: e.target.value }))}
                  className={inputCls}
                  placeholder="ex: 85"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1.5">
                  Durée estimée (min)
                  {form.dureeEstimeeTotale && <span className="ml-1 text-brand-500 normal-case tracking-normal">· calculée</span>}
                </label>
                <input
                  type="number" min="1" value={form.dureeEstimeeTotale}
                  onChange={e => setForm(f => ({ ...f, dureeEstimeeTotale: e.target.value }))}
                  className={inputCls}
                  placeholder="ex: 90"
                />
              </div>
            </div>
          </Card>

          {/* Date & Prix */}
          <Card title="Date & Prix" icon={
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <rect x="1.5" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1.5 7H13.5M5 1.5V4M10 1.5V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          }>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1.5">Date</label>
                <input type="date" required value={form.dateDepart}
                  onChange={e => setForm(f => ({ ...f, dateDepart: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1.5">Heure</label>
                <input type="time" required value={form.heureDepart}
                  onChange={e => setForm(f => ({ ...f, heureDepart: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1.5">Places disponibles</label>
                <input type="number" min="1" max="8" required value={form.placesTotal}
                  onChange={e => setForm(f => ({ ...f, placesTotal: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1.5">Prix / place (MAD)</label>
                <input type="number" min="0" step="any" required value={form.prixParPlace}
                  onChange={e => setForm(f => ({ ...f, prixParPlace: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>
          </Card>

          {/* Véhicule */}
          <Card title="Véhicule" icon={
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 10L3.5 7H11.5L13 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <rect x="1.5" y="9.5" width="12" height="2.5" rx="1.25" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="4.5" cy="12.5" r="1" fill="currentColor" />
              <circle cx="10.5" cy="12.5" r="1" fill="currentColor" />
              <path d="M4.5 7L6 4.5H9L10.5 7H4.5Z" fill="currentColor" fillOpacity="0.3" />
            </svg>
          }>
            {vehicules.length > 0 && (
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1.5">Sélectionner</label>
                <select value={form.vehiculeId} onChange={e => setForm(f => ({ ...f, vehiculeId: e.target.value }))} className={inputCls}>
                  <option value="">Choisir un véhicule</option>
                  {vehicules.map(v => (
                    <option key={v.id} value={v.id}>{v.couleur} · {v.marque} {v.modele} — {v.immatriculation}</option>
                  ))}
                </select>
              </div>
            )}

            {!showAddVehicule ? (
              <button type="button" onClick={() => setShowAddVehicule(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-[color] duration-150">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Ajouter un véhicule
              </button>
            ) : (
              <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F7F7F4] p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[['Marque', 'marque'], ['Modèle', 'modele'], ['Couleur', 'couleur'], ['Immatriculation', 'immatriculation']].map(([label, key]) => (
                    <div key={key}>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1.5">{label}</label>
                      <input value={newVehicule[key]} onChange={e => setNewVehicule(v => ({ ...v, [key]: e.target.value }))} className={inputCls} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleAddVehicule}
                    className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition-[background-color] duration-150">
                    Ajouter
                  </button>
                  <button type="button" onClick={() => setShowAddVehicule(false)}
                    className="px-4 py-2 rounded-xl border border-[rgba(0,0,0,0.1)] text-sm text-[#5A7265] hover:bg-[#F0F0EC] transition-[background-color] duration-150">
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </Card>

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 active:scale-[0.98] transition-[background-color,transform] duration-150 disabled:opacity-50 shadow-brand-lg">
            {loading ? 'Publication…' : 'Publier l\'annonce'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputCls = 'w-full rounded-xl border border-[rgba(0,0,0,0.1)] bg-white px-4 py-2.5 text-sm text-[#111713] focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-[border-color,box-shadow] duration-150'

function Card({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] shadow-card p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-[rgba(0,0,0,0.06)]">
        <span className="text-brand-600">{icon}</span>
        <h2 className="text-base font-display font-bold text-[#111713]">{title}</h2>
      </div>
      {children}
    </div>
  )
}
