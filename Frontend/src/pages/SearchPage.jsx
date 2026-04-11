import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchAnnonces } from '../api/annonceAPI'
import AnnonceCard from '../components/AnnonceCard'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    villeDepart:  searchParams.get('villeDepart')  || '',
    villeArrivee: searchParams.get('villeArrivee') || '',
    date:         searchParams.get('date')         || '',
    places:       searchParams.get('places')       || '1',
  })

  const search = async (params) => {
    setLoading(true)
    try {
      const { data } = await searchAnnonces(params)
      setAnnonces(data)
    } catch {
      setAnnonces([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (form.villeDepart || form.villeArrivee) {
      search(form)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSearchParams(form)
    search(form)
  }

  return (
    <div className="min-h-screen pt-24 max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl mb-8">Rechercher un trajet</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-wrap gap-4 mb-10">
        {[
          { label: 'Départ', key: 'villeDepart', placeholder: 'Alger' },
          { label: 'Arrivée', key: 'villeArrivee', placeholder: 'Oran' },
        ].map(({ label, key, placeholder }) => (
          <div key={key} className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-stone-500 mb-1">{label}</label>
            <input
              value={form[key]} placeholder={placeholder}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Date</label>
          <input
            type="date" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Places</label>
          <input
            type="number" min="1" value={form.places}
            onChange={e => setForm(f => ({ ...f, places: e.target.value }))}
            className="w-20 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
          />
        </div>
        <div className="flex items-end">
          <button type="submit"
            className="px-5 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium
              hover:bg-brand-700 active:scale-[0.98] transition-[transform,background-color] duration-150">
            Rechercher
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-stone-400 text-sm">Recherche en cours…</p>
      ) : annonces.length === 0 ? (
        <p className="text-stone-400 text-sm">Aucun trajet trouvé.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {annonces.map(a => (
            <AnnonceCard key={a.id} annonce={a} onReserved={() => search(form)} />
          ))}
        </div>
      )}
    </div>
  )
}
