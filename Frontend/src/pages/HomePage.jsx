import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" fill="currentColor" fillOpacity="0.9" />
      </svg>
    ),
    title: 'Réservation instantanée',
    desc: 'Votre place est confirmée dès que le conducteur accepte. Zéro attente, zéro friction.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6.5V10.5L12.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Trajets précis',
    desc: 'Adresses exactes avec cartographie OpenStreetMap. Ne vous ratez plus jamais au point de rendez-vous.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10C3 7.5 5 5 10 5C15 5 17 7.5 17 10M10 5V3M7 14.5C7 14.5 8 16 10 16C12 16 13 14.5 13 14.5M6 11.5C6 11.5 7.5 13 10 13C12.5 13 14 11.5 14 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Paiement de main à main',
    desc: 'Pas d\'intermédiaire, pas de commission. Vous réglez directement avec votre conducteur.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ villeDepart: '', villeArrivee: '', date: '' })

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(form).toString()
    navigate(`/search?${params}`)
  }

  return (
    <main className="min-h-screen">

      {/* ── Hero ── */}
      <section className="bg-[#00854B] pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">

          <h1 className="anim-fade-up text-white text-5xl md:text-[4rem] font-display font-extrabold mb-5">
            Voyagez ensemble,<br />dépensez moins.
          </h1>

          <p className="anim-fade-up-1 text-white/80 text-lg mb-10 max-w-md mx-auto font-normal">
            Trouvez un trajet partagé entre villes en quelques secondes. Économique, pratique, humain.
          </p>

          {/* Search card */}
          <form
            onSubmit={handleSearch}
            className="anim-fade-up-2 bg-white rounded-2xl p-3 flex flex-col md:flex-row gap-2 shadow-[0_4px_24px_rgba(0,0,0,0.18)]"
          >
            <div className="flex-1 relative">
              <label className="absolute left-4 top-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#8AA899]">Départ</label>
              <input
                placeholder="Casablanca, Rabat…"
                value={form.villeDepart}
                onChange={e => setForm(f => ({ ...f, villeDepart: e.target.value }))}
                className="w-full pt-7 pb-2.5 px-4 rounded-xl text-sm text-[#1A1A1A] placeholder-[#B0C4BA] focus:outline-none focus:bg-[#F0FBF5] transition-[background-color] duration-200 font-medium"
              />
            </div>

            <div className="hidden md:flex items-center text-[#C8D9D0] font-bold text-lg">→</div>

            <div className="flex-1 relative">
              <label className="absolute left-4 top-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#8AA899]">Arrivée</label>
              <input
                placeholder="Marrakech, Fès…"
                value={form.villeArrivee}
                onChange={e => setForm(f => ({ ...f, villeArrivee: e.target.value }))}
                className="w-full pt-7 pb-2.5 px-4 rounded-xl text-sm text-[#1A1A1A] placeholder-[#B0C4BA] focus:outline-none focus:bg-[#F0FBF5] transition-[background-color] duration-200 font-medium"
              />
            </div>

            <div className="w-px hidden md:block bg-[#EAF0EC] self-stretch" />

            <div className="relative">
              <label className="absolute left-4 top-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#8AA899]">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full md:w-auto pt-7 pb-2.5 px-4 rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:bg-[#F0FBF5] transition-[background-color] duration-200 font-medium"
              />
            </div>

            <button
              type="submit"
              className="px-7 py-3 rounded-xl bg-[#00854B] text-white text-sm font-bold hover:bg-[#006D3D] active:scale-[0.97] transition-[background-color,transform] duration-150 whitespace-nowrap"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold text-[#1A1A1A] mb-3">
            Pourquoi CoVoiture ?
          </h2>
          <p className="text-[#666] text-base max-w-sm mx-auto">
            Simple, transparent, et conçu pour la route marocaine.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="group p-7 rounded-2xl bg-white border border-[rgba(0,0,0,0.07)] shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-[transform,box-shadow] duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F0FBF5] text-[#00854B] flex items-center justify-center mb-5 group-hover:bg-[#D6F5E7] transition-[background-color] duration-200">
                {icon}
              </div>
              <h3 className="text-lg font-display font-bold text-[#1A1A1A] mb-2">{title}</h3>
              <p className="text-[#666] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-2xl bg-[#F0FBF5] border border-[#B8E8D0] p-12 text-center">
          <h2 className="font-display font-extrabold text-[#00854B] text-3xl md:text-4xl mb-4">
            Vous conduisez ? Rentabilisez vos trajets.
          </h2>
          <p className="text-[#4A6A55] mb-8 max-w-md mx-auto">
            Publiez une annonce en moins de 2 minutes et trouvez des passagers sur votre route.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#00854B] text-white text-sm font-bold hover:bg-[#006D3D] active:scale-[0.97] transition-[background-color,transform] duration-150"
          >
            Devenir conducteur
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

    </main>
  )
}
