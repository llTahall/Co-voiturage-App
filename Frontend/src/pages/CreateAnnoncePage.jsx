import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAnnonce } from '../api/annonceAPI'
import { getMesVehicules, createVehicule } from '../api/vehiculeAPI'
import MapPicker from '../components/MapPicker'

export default function CreateAnnoncePage() {
  const navigate = useNavigate()
  const [vehicules, setVehicules] = useState([])
  const [depart, setDepart] = useState({})
  const [arrivee, setArrivee] = useState({})
  const [form, setForm] = useState({
    vehiculeId: '',
    dateDepart: '',
    heureDepart: '',
    placesTotal: 3,
    prixParPlace: '',
    dureeEstimee: '',
  })
  const [newVehicule, setNewVehicule] = useState({ marque: '', modele: '', couleur: '', immatriculation: '' })
  const [showAddVehicule, setShowAddVehicule] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getMesVehicules().then(({ data }) => setVehicules(data))
  }, [])

  const handleAddVehicule = async () => {
    const { data } = await createVehicule(newVehicule)
    setVehicules(v => [...v, data])
    setForm(f => ({ ...f, vehiculeId: data.id }))
    setShowAddVehicule(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createAnnonce({
        ...form,
        vehiculeId: Number(form.vehiculeId),
        placesTotal: Number(form.placesTotal),
        prixParPlace: Number(form.prixParPlace),
        dureeEstimee: form.dureeEstimee ? Number(form.dureeEstimee) : null,
        villeDepart: depart.ville,
        adresseDepart: depart.adresse,
        latitudeDepart: depart.lat,
        longitudeDepart: depart.lon,
        villeArrivee: arrivee.ville,
        adresseArrivee: arrivee.adresse,
        latitudeArrivee: arrivee.lat,
        longitudeArrivee: arrivee.lon,
      })
      navigate('/mes-annonces')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la publication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-4xl mb-2">Publier une annonce</h1>
      <p className="text-stone-500 mb-8">Renseignez votre trajet pour trouver des passagers.</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-display border-b border-stone-100 pb-2">Trajet</h2>
          <MapPicker label="Point de départ" value={depart} onChange={setDepart} />
          <MapPicker label="Destination" value={arrivee} onChange={setArrivee} />
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Durée estimée (min)</label>
            <input type="number" min="1" value={form.dureeEstimee}
              onChange={e => setForm(f => ({ ...f, dureeEstimee: e.target.value }))}
              className="w-32 rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-display border-b border-stone-100 pb-2">Départ</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
              <input type="date" required value={form.dateDepart}
                onChange={e => setForm(f => ({ ...f, dateDepart: e.target.value }))}
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Heure</label>
              <input type="time" required value={form.heureDepart}
                onChange={e => setForm(f => ({ ...f, heureDepart: e.target.value }))}
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Places disponibles</label>
              <input type="number" min="1" max="8" required value={form.placesTotal}
                onChange={e => setForm(f => ({ ...f, placesTotal: e.target.value }))}
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Prix / place (DZD)</label>
              <input type="number" min="0" step="any" required value={form.prixParPlace}
                onChange={e => setForm(f => ({ ...f, prixParPlace: e.target.value }))}
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-display border-b border-stone-100 pb-2">Véhicule</h2>
          {vehicules.length > 0 ? (
            <select value={form.vehiculeId} onChange={e => setForm(f => ({ ...f, vehiculeId: e.target.value }))}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400"
              required>
              <option value="">Choisir un véhicule</option>
              {vehicules.map(v => (
                <option key={v.id} value={v.id}>{v.couleur} · {v.marque} {v.modele} — {v.immatriculation}</option>
              ))}
            </select>
          ) : null}

          {!showAddVehicule ? (
            <button type="button" onClick={() => setShowAddVehicule(true)}
              className="text-sm text-brand-600 hover:underline">
              + Ajouter un véhicule
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-4 bg-stone-50 rounded-xl">
              {[['Marque','marque'],['Modèle','modele'],['Couleur','couleur'],['Immatriculation','immatriculation']].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
                  <input value={newVehicule[key]}
                    onChange={e => setNewVehicule(v => ({ ...v, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                  />
                </div>
              ))}
              <div className="col-span-2 flex gap-2">
                <button type="button" onClick={handleAddVehicule}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm hover:bg-brand-700 transition-colors duration-150">
                  Ajouter
                </button>
                <button type="button" onClick={() => setShowAddVehicule(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-sm hover:bg-stone-100 transition-colors duration-150">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </section>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-brand-600 text-white font-medium
            hover:bg-brand-700 active:scale-[0.98] transition-[transform,background-color] duration-150
            disabled:opacity-50">
          {loading ? 'Publication…' : 'Publier l\'annonce'}
        </button>
      </form>
    </div>
  )
}
