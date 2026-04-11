import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function HomePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ villeDepart: '', villeArrivee: '', date: '' })

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(form).toString()
    navigate(`/search?${params}`)
  }

  return (
    <main className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 text-white px-6 py-32">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl mb-6 leading-[1.05]">
            Voyagez ensemble,<br />dépensez moins.
          </h1>
          <p className="text-brand-200 text-xl mb-12 font-light">
            Trouvez un trajet partagé en quelques secondes.
          </p>

          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-4 flex flex-col md:flex-row gap-3 shadow-2xl shadow-brand-950/40"
          >
            <input
              placeholder="Ville de départ"
              value={form.villeDepart}
              onChange={e => setForm(f => ({ ...f, villeDepart: e.target.value }))}
              className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-400"
            />
            <input
              placeholder="Ville d'arrivée"
              value={form.villeArrivee}
              onChange={e => setForm(f => ({ ...f, villeArrivee: e.target.value }))}
              className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-400"
            />
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-brand-400"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-medium
                hover:bg-brand-700 active:scale-[0.98] transition-[transform,background-color] duration-150"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-10">
        {[
          { title: 'Réservation instantanée', desc: 'Votre place est confirmée automatiquement si disponible. Zéro attente.' },
          { title: 'Paiement de main à main', desc: 'Pas d\'intermédiaire. Vous réglez directement avec le conducteur.' },
          { title: 'Trajets précis', desc: 'Adresses exactes avec cartographie OpenStreetMap pour ne jamais se rater.' },
        ].map(({ title, desc }) => (
          <div key={title} className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-brand-500" />
            </div>
            <h3 className="text-xl font-display">{title}</h3>
            <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
