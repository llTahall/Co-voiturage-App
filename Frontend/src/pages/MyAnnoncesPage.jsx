import { useEffect, useState } from 'react'
import { getMesAnnonces, annulerAnnonce, terminerAnnonce } from '../api/annonceAPI'
import AnnonceCard from '../components/AnnonceCard'
import { Link } from 'react-router-dom'

const STATUS_LABELS = {
  PUBLIEE: { label: 'Disponible', cls: 'bg-brand-50 text-brand-700 border-brand-200' },
  COMPLETE: { label: 'Complet', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  ANNULEE: { label: 'Annulée', cls: 'bg-stone-100 text-stone-500 border-stone-200' },
}

export default function MyAnnoncesPage() {
  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('actives')
  const [filterStatus, setFilterStatus] = useState('TOUS')

  const load = () => getMesAnnonces()
    .then(({ data }) => {
      const unique = data.filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i)
      setAnnonces(unique)
    })
    .finally(() => setLoading(false))

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleAnnuler = async (id) => {
    await annulerAnnonce(id)
    load()
  }

  const handleTerminer = async (id) => {
    try {
      await terminerAnnonce(id)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Impossible de terminer ce trajet pour le moment')
    }
  }

  const actives = annonces.filter(a => a.statut !== 'ANNULEE' && a.statut !== 'TERMINEE')
  const hasActiveAnnonce = annonces.some(a => ['PUBLIEE', 'COMPLETE'].includes(a.statut))

  const historique = filterStatus === 'TOUS'
    ? annonces
    : annonces.filter(a => a.statut === filterStatus)

  const displayed = tab === 'actives' ? actives : historique

  return (
    <div className="min-h-screen pt-[68px] bg-[#F4F4F4]">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[2.2rem] font-display font-bold text-[#1A1A1A]">Mes annonces</h1>
            <p className="text-[#666] mt-1 text-sm">Gérez vos trajets publiés.</p>
          </div>

          {hasActiveAnnonce ? (
            <div
              title="Terminez votre annonce active avant d'en créer une nouvelle"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F0F0EC] text-sm font-semibold text-[#8AA899] cursor-not-allowed select-none"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Annonce active en cours
            </div>
          ) : (
            <Link
              to="/annonces/create"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 active:scale-[0.97] transition-[background-color,transform] duration-150 shadow-brand"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Nouvelle annonce
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white rounded-xl p-1 border border-[rgba(0,0,0,0.07)] w-fit shadow-card">
          {[
            { key: 'actives', label: `Actives (${actives.length})` },
            { key: 'historique', label: 'Historique' },
          ].map(({ key, label }) => (
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

        {/* Filtre historique */}
        {tab === 'historique' && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-xs font-semibold text-[#888] uppercase tracking-wide">Filtrer :</span>
            {['TOUS', 'PUBLIEE', 'COMPLETE', 'ANNULEE', 'TERMINEE'].map(s => {
              const cfg = STATUS_LABELS[s] ?? { label: 'Tous', cls: 'bg-stone-100 text-stone-600 border-stone-200' }
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-[opacity] duration-150 ${s === 'TOUS' ? 'bg-stone-100 text-stone-600 border-stone-200' : cfg.cls
                    } ${filterStatus === s ? 'opacity-100 ring-2 ring-offset-1 ring-brand-400' : 'opacity-60 hover:opacity-100'}`}
                >
                  {s === 'TOUS' ? 'Tous' : s === 'TERMINEE' ? 'Terminées' : cfg.label}
                </button>
              )
            })}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 text-[#666] text-sm py-12">
            <div className="w-4 h-4 rounded-full border-2 border-brand-300 border-t-brand-600 animate-spin" />
            Chargement…
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[rgba(0,0,0,0.07)]">
            <p className="text-[#1A1A1A] font-semibold text-lg mb-1">
              {tab === 'actives' ? 'Aucune annonce active' : "Aucune annonce dans l'historique"}
            </p>
            <p className="text-[#888] text-sm">
              {tab === 'actives' ? 'Publiez votre premier trajet.' : 'Modifiez le filtre pour voir plus de résultats.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {displayed.map(a => (
              <div key={a.id} className="relative">
                <AnnonceCard annonce={a} />
                <div className="flex gap-4 mt-2 ml-1">
                  {a.statut === 'PUBLIEE' && (
                    <button
                      onClick={() => handleAnnuler(a.id)}
                      className="text-xs text-[#AAA] hover:text-red-500 transition-[color] duration-150 font-medium"
                    >
                      Annuler l'annonce
                    </button>
                  )}
                  {(a.statut === 'PUBLIEE' || a.statut === 'COMPLETE') && (
                    <button
                      onClick={() => handleTerminer(a.id)}
                      className="text-xs text-[#AAA] hover:text-brand-700 transition-[color] duration-150 font-medium"
                    >
                      Terminer le trajet
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
