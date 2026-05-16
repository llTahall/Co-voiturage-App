import { useEffect, useState } from 'react'
import { getMesAnnonces, annulerAnnonce, demarrerAnnonce, terminerAnnonce } from '../../api/annonceAPI'
import { getMesPassagers } from '../../api/reservationAPI'
import AnnonceCard from '../../components/AnnonceCard'
import EvaluationModal from '../../components/EvaluationModal'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'

const STATUS_LABELS = {
  PUBLIEE: { label: 'Disponible', cls: 'bg-brand-50 text-brand-700 border-brand-200' },
  COMPLETE: { label: 'Complet', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  EN_COURS: { label: 'En cours', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  ANNULEE: { label: 'Annulée', cls: 'bg-stone-100 text-stone-500 border-stone-200' },
}

export default function MyAnnoncesPage() {
  const [annonces, setAnnonces] = useState([])
  const [passagersByAnnonce, setPassagersByAnnonce] = useState({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('actives')
  const [filterStatus, setFilterStatus] = useState('TOUS')
  const [evalQueue, setEvalQueue] = useState([])
  const [evalIndex, setEvalIndex] = useState(0)

  const { notifications } = useNotifications()

  const load = () => Promise.all([getMesAnnonces(), getMesPassagers()])
    .then(([{ data: annoncesData }, { data: reservationsData }]) => {
      const unique = annoncesData.filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i)
      setAnnonces(unique)
      const grouped = {}
      reservationsData.forEach(r => {
        if (r.statut === 'ACCEPTEE' && r.annonce?.id) {
          if (!grouped[r.annonce.id]) grouped[r.annonce.id] = []
          grouped[r.annonce.id].push(r.passager)
        }
      })
      setPassagersByAnnonce(grouped)
    })
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  useEffect(() => {
    const latest = notifications[0]
    if (latest?.type === 'RESERVATION_ANNULEE_PASSAGER') load()
  }, [notifications.length])

  const handleAnnuler = async (id) => {
    await annulerAnnonce(id)
    load()
  }

  const handleDemarrer = async (id) => {
    try {
      await demarrerAnnonce(id)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Erreur lors du démarrage')
    }
  }

  const handleTerminer = async (id) => {
    try {
      await terminerAnnonce(id)
      load()
      const { data: reservations } = await getMesPassagers()
      const toEval = reservations.filter(r =>
        r.annonce?.id === id && r.statut === 'ACCEPTEE' && !r.hasEvaluated
      )
      if (toEval.length > 0) {
        setEvalQueue(toEval)
        setEvalIndex(0)
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Impossible de terminer ce trajet pour le moment')
    }
  }

  const handleEvalDone = () => {
    if (evalIndex + 1 < evalQueue.length) {
      setEvalIndex(i => i + 1)
    } else {
      setEvalQueue([])
      setEvalIndex(0)
    }
  }

  const handleEvalClose = () => {
    setEvalQueue([])
    setEvalIndex(0)
  }

  const actives = annonces.filter(a => a.statut !== 'ANNULEE' && a.statut !== 'TERMINEE')
  const hasActiveAnnonce = annonces.some(a => ['PUBLIEE', 'COMPLETE', 'EN_COURS'].includes(a.statut))

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
            {displayed.map(a => {
              if (a.statut === 'EN_COURS') {
                const etapes = [...(a.trajet?.etapes ?? [])].sort((x, y) => x.ordre - y.ordre)
                const depart = etapes[0]?.ville ?? '—'
                const arrivee = etapes[etapes.length - 1]?.ville ?? '—'
                const date = a.dateDepart
                  ? new Date(a.dateDepart).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
                  : '—'
                const passagers = (passagersByAnnonce[a.id] ?? []).filter(Boolean)
                return (
                  <div key={a.id} className="bg-white rounded-2xl border border-brand-300 ring-1 ring-brand-200 shadow-card overflow-hidden">
                    <div className="bg-brand-600 px-5 py-2.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="text-white text-xs font-bold tracking-wide uppercase">Trajet en cours</span>
                    </div>
                    <div className="p-5 flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 font-display font-bold text-lg text-[#1A1A1A]">
                          <span className="truncate">{depart}</span>
                          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="shrink-0 text-brand-500">
                            <path d="M1 5h13M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="truncate">{arrivee}</span>
                        </div>
                        <p className="text-sm text-[#666]">
                          {date}{a.heureDepart && <> · {a.heureDepart.slice(0, 5)}</>}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-brand-50 text-brand-700 border-brand-200">
                          En cours
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-display font-bold text-brand-600 leading-tight">{a.prixParPlace ?? '—'}</p>
                        <p className="text-[10px] text-[#8AA899] font-medium uppercase tracking-wide mt-0.5">MAD / place</p>
                      </div>
                    </div>
                    {passagers.length > 0 && (
                      <div className="mx-5 mb-5 rounded-2xl border border-brand-100 bg-brand-50 overflow-hidden">
                        <div className="px-4 py-2 border-b border-brand-100">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-600">
                            Vos passagers ({passagers.length})
                          </p>
                        </div>
                        <div className="divide-y divide-brand-100">
                          {passagers.map(p => (
                            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                              <div className="w-11 h-11 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold uppercase shrink-0">
                                {p.prenom?.charAt(0)}{p.nom?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#1A1A1A]">{p.prenom} {p.nom}</p>
                                {p.telephone && <p className="text-xs text-[#666] mt-0.5">{p.telephone}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => handleTerminer(a.id)}
                        className="w-full py-2.5 rounded-xl bg-[#1A1A1A] text-white text-sm font-bold hover:bg-[#333] active:scale-[0.97] transition-[background-color,transform] duration-150"
                      >
                        Terminer le trajet
                      </button>
                    </div>
                  </div>
                )
              }
              return (
                <div key={a.id} className="relative">
                  <AnnonceCard annonce={a} />
                  <div className="flex items-center gap-3 mt-2 ml-1">
                    {(a.statut === 'PUBLIEE' || a.statut === 'COMPLETE') && (
                      <button
                        onClick={() => handleAnnuler(a.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-[color] duration-150 font-medium"
                      >
                        Annuler
                      </button>
                    )}
                    {(a.statut === 'PUBLIEE' || a.statut === 'COMPLETE') && (
                      <button
                        onClick={() => handleDemarrer(a.id)}
                        className="text-xs font-bold px-4 py-1.5 rounded-lg bg-[#00854B] text-white hover:bg-[#006D3D] active:scale-[0.97] transition-[background-color,transform] duration-150 shadow-[0_2px_6px_rgba(0,133,75,0.3)]"
                      >
                        Démarrer le trajet
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {evalQueue.length > 0 && evalIndex < evalQueue.length && (() => {
        const r = evalQueue[evalIndex]
        return (
          <EvaluationModal
            key={r.id}
            reservation={r}
            destinataireId={r.passager?.id}
            destinataireName={`${r.passager?.prenom ?? ''} ${r.passager?.nom ?? ''}`}
            queueInfo={evalQueue.length > 1 ? { current: evalIndex + 1, total: evalQueue.length } : null}
            onClose={handleEvalClose}
            onDone={handleEvalDone}
          />
        )
      })()}
    </div>
  )
}
