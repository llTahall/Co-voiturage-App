import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { searchAnnonces } from '../api/annonceAPI'
import { getMesReservations } from '../api/reservationAPI'
import { useAuth } from '../context/AuthContext'
import AnnonceCard from '../components/AnnonceCard'


export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading] = useState(false)
  const [reservedIds, setReservedIds] = useState(new Set())
  const [activeReservation, setActiveReservation] = useState(null)
  const { isAuthenticated } = useAuth()

  const [form, setForm] = useState({
    villeDepart: searchParams.get('villeDepart') || '',
    villeArrivee: searchParams.get('villeArrivee') || '',
    date: searchParams.get('date') || '',
    places: searchParams.get('places') || '1',
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
    search(form)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    getMesReservations()
      .then(({ data }) => {
        // Uniquement les réservations actives (pas les annulées)
        const ids = new Set(
          data
            .filter(r => ['EN_ATTENTE', 'ACCEPTEE'].includes(r.statut))
            .map(r => r.annonce?.id)
            .filter(Boolean)
        )
        setReservedIds(ids)
        const active = data.find(r => ['EN_ATTENTE', 'ACCEPTEE'].includes(r.statut))
        setActiveReservation(active ?? null)
      })
      .catch(() => { })
  }, [isAuthenticated])


  const handleSubmit = (e) => {
    e.preventDefault()
    setSearchParams(form)
    search(form)
  }

  return (
    <div className="min-h-screen pt-[68px] bg-[#F4F4F4]">

      {/* Search bar */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.07)] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            {[
              { key: 'villeDepart', label: 'Départ', placeholder: 'Casablanca' },
              { key: 'villeArrivee', label: 'Arrivée', placeholder: 'Rabat' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="flex-1 min-w-[130px]">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1.5">{label}</label>
                <input
                  value={form[key]} placeholder={placeholder}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F4F4F4] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#AABDB3] focus:outline-none focus:border-brand-400 focus:bg-white transition-[border-color,background-color] duration-150 font-medium"
                />
              </div>
            ))}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1.5">Date</label>
              <input type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F4F4F4] px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-brand-400 focus:bg-white transition-[border-color,background-color] duration-150"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1.5">Places</label>
              <input type="number" min="1" value={form.places}
                onChange={e => setForm(f => ({ ...f, places: e.target.value }))}
                className="w-20 rounded-xl border border-[rgba(0,0,0,0.1)] bg-[#F4F4F4] px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-brand-400 focus:bg-white transition-[border-color,background-color] duration-150 text-center"
              />
            </div>
            <button type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 active:scale-[0.97] transition-[background-color,transform] duration-150 shadow-brand"
            >
              Rechercher
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">

        {/* Bannière réservation active */}
        {activeReservation && (
          <div className="bg-white rounded-2xl border-l-4 border-brand-600 border border-[rgba(0,0,0,0.07)] shadow-card p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l5 5 8-8" stroke="#00854B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#1A1A1A] text-sm">Trajet réservé</p>
                <p className="text-[#666] text-xs mt-0.5">
                  {activeReservation.annonce?.trajet?.villeDepart} → {activeReservation.annonce?.trajet?.villeArrivee}
                  {activeReservation.annonce?.dateDepart && (
                    <span> · {new Date(activeReservation.annonce.dateDepart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
                  )}
                </p>
              </div>
            </div>
            <Link
              to="/mes-reservations"
              className="shrink-0 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-[background-color] duration-150"
            >
              Voir ma réservation
            </Link>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex items-center gap-3 text-[#666] text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-brand-300 border-t-brand-600 animate-spin" />
            Recherche en cours…
          </div>
        ) : annonces.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-[#EAEAEA] flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="12" cy="12" r="8" stroke="#888" strokeWidth="1.8" />
                <path d="M18.5 18.5L24 24" stroke="#888" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[#1A1A1A] font-semibold text-lg mb-1">Aucun trajet trouvé</p>
            <p className="text-[#888] text-sm">Essayez d'autres villes ou une autre date.</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-[#1A1A1A]">
              {annonces.length} trajet{annonces.length > 1 ? 's' : ''} trouvé{annonces.length > 1 ? 's' : ''}
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              {annonces.map(a => (
                <AnnonceCard
                  key={a.id}
                  annonce={a}
                  onReserved={() => search(form)}
                  alreadyReserved={reservedIds.has(a.id)}
                  hasActiveReservation={!!activeReservation && !reservedIds.has(a.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
