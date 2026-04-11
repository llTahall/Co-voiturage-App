import { useEffect, useState } from 'react'
import { getMesAnnonces, annulerAnnonce } from '../api/annonceAPI'
import AnnonceCard from '../components/AnnonceCard'
import { Link } from 'react-router-dom'

export default function MyAnnoncesPage() {
  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => getMesAnnonces()
    .then(({ data }) => setAnnonces(data))
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleAnnuler = async (id) => {
    await annulerAnnonce(id)
    load()
  }

  return (
    <div className="min-h-screen pt-24 max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl">Mes annonces</h1>
        <Link to="/annonces/create"
          className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors duration-150">
          + Nouvelle annonce
        </Link>
      </div>

      {loading ? (
        <p className="text-stone-400 text-sm">Chargement…</p>
      ) : annonces.length === 0 ? (
        <p className="text-stone-400 text-sm">Vous n'avez pas encore d'annonces.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {annonces.map(a => (
            <div key={a.id} className="relative">
              <AnnonceCard annonce={a} />
              {a.statut === 'PUBLIEE' && (
                <button
                  onClick={() => handleAnnuler(a.id)}
                  className="mt-2 text-xs text-stone-400 hover:text-red-500 transition-colors duration-150">
                  Annuler l'annonce
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
