import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', motDePasse: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.motDePasse)
      navigate('/')
    } catch {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative overflow-hidden"
        style={{ background: '#00854B' }}

      >
        <div
          className="pointer-events-none absolute top-0 right-0 w-[400px] h-[400px]"
          style={{ background: '#00854B' }}

        />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M3 11.5L4.5 8.5H12.5L14 11.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
              <rect x="2" y="11" width="13" height="2.5" rx="1.25" fill="white" fillOpacity="0.9" />
              <circle cx="5" cy="14" r="1.25" fill="white" />
              <circle cx="12" cy="14" r="1.25" fill="white" />
              <path d="M5.5 8.5L7 5.5H10L11.5 8.5H5.5Z" fill="white" fillOpacity="0.75" />
            </svg>
          </div>
          <span className="font-display text-lg font-bold text-white tracking-[-0.02em]">
            CoVoiture
          </span>
        </Link>

        {/* Tagline */}
        <div className="relative z-10 space-y-6">
          <blockquote className="text-[2rem] font-display font-bold text-white leading-tight">
            "La route est plus belle<br />quand on la partage."
          </blockquote>
          <p className="text-[#7AA88C] text-sm leading-relaxed max-w-xs">
            Rejoignez des milliers d'Algériens qui voyagent ensemble chaque jour. Économique, convivial, responsable.
          </p>
          <div className="flex gap-6 pt-2">
            {[['12k+', 'Trajets'], ['48', 'Wilayas'], ['4.8★', 'Note']].map(([v, l]) => (
              <div key={l}>
                <p className="text-white font-display font-bold text-xl">{v}</p>
                <p className="text-[#5A8870] text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#3A5C47] text-xs relative z-10">© 2025 CoVoiture</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-20 bg-[#F7F7F4]">
        <div className="w-full max-w-sm anim-fade-up">
          <div className="mb-8">
            <h1 className="text-[2.2rem] font-display font-bold text-[#111713]">Connexion</h1>
            <p className="text-[#5A7265] mt-1.5">Bon retour sur CoVoiture.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Adresse email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="vous@exemple.com"
              required
            />
            <Field
              label="Mot de passe"
              type="password"
              value={form.motDePasse}
              onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
                  <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M7.5 4.5V8M7.5 10.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 active:scale-[0.98] transition-[background-color,transform] duration-150 disabled:opacity-50 shadow-brand mt-2"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#5A7265]">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors duration-150">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#4A6A55] mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-xl border border-[rgba(0,0,0,0.1)] bg-white px-4 py-3 text-sm text-[#111713] placeholder-[#AABDB3] focus:outline-none focus:border-brand-400 focus:ring-3 focus:ring-brand-100 transition-[border-color,box-shadow] duration-150"
      />
    </div>
  )
}
