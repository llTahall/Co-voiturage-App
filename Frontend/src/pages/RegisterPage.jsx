import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../api/axiosConfig'

const RULES = {
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    msg: 'Email invalide'
  },
  motDePasse: {
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-])[A-Za-z\d@$!%*?&._\-]{8,}$/,
    msg: 'Min. 8 caractères, une majuscule, un chiffre, un caractère spécial (@$!%*?&._-)'
  },
  telephone: {
    regex: /^(\+212|0)(6|7)\d{8}$/,
    msg: 'Numéro marocain invalide (ex: 0612345678 ou +212612345678)'
  }
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', motDePasse: '', telephone: '', role: 'PASSAGER'
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.prenom.trim()) newErrors.prenom = 'Requis'
    if (!form.nom.trim()) newErrors.nom = 'Requis'
    if (!RULES.email.regex.test(form.email)) newErrors.email = RULES.email.msg
    if (!RULES.motDePasse.regex.test(form.motDePasse)) newErrors.motDePasse = RULES.motDePasse.msg
    if (form.telephone && !RULES.telephone.regex.test(form.telephone)) newErrors.telephone = RULES.telephone.msg
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return }

    setLoading(true)
    try {
      await axiosInstance.post('/api/auth/register', form)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setServerError(err.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative overflow-hidden" style={{ background: '#00854B' }}>
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
          <span className="font-display text-lg font-bold text-white tracking-[-0.02em]">CoVoiture</span>
        </Link>
        <div className="relative z-10 space-y-3">
          {['Inscription gratuite et rapide', 'Voyagez pour moins cher', 'Conducteur ? Rentabilisez vos trajets', 'Communauté vérifiée et fiable'].map(text => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">✓</div>
              <span className="text-[#A8C4B4] text-sm">{text}</span>
            </div>
          ))}
        </div>
        <p className="text-[#3A5C47] text-xs relative z-10">© 2025 CoVoiture</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-[#F7F7F4] overflow-y-auto">
        <div className="w-full max-w-sm anim-fade-up">
          <div className="mb-7">
            <h1 className="text-[2.2rem] font-display font-bold text-[#111713]">Créer un compte</h1>
            <p className="text-[#5A7265] mt-1.5">Rejoignez la communauté CoVoiture.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Prénom" value={form.prenom} onChange={set('prenom')} placeholder="Yacine" error={errors.prenom} />
              <Field label="Nom" value={form.nom} onChange={set('nom')} placeholder="Benali" error={errors.nom} />
            </div>
            <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="vous@exemple.com" error={errors.email} />
            <Field label="Mot de passe" type="password" value={form.motDePasse} onChange={set('motDePasse')} placeholder="Min. 8 car., majuscule, chiffre, @$!..." error={errors.motDePasse} />
            <Field label="Téléphone (optionnel)" type="tel" value={form.telephone} onChange={set('telephone')} placeholder="0612345678" error={errors.telephone} />

            <div>
              <label className="block text-xs font-semibold text-[#4A6A55] mb-1.5 uppercase tracking-wide">Je suis</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'PASSAGER', label: 'Passager', desc: 'Je cherche des trajets' },
                  { value: 'CONDUCTEUR', label: 'Conducteur', desc: 'Je propose des trajets' },
                ].map(({ value, label, desc }) => (
                  <label key={value} className={`cursor-pointer flex flex-col gap-0.5 rounded-xl border-2 p-3.5 transition-[border-color,background-color] duration-150 ${form.role === value ? 'border-brand-500 bg-brand-50' : 'border-[rgba(0,0,0,0.1)] bg-white hover:border-brand-300'}`}>
                    <input type="radio" name="role" value={value} checked={form.role === value} onChange={set('role')} className="sr-only" />
                    <span className="text-sm font-bold text-[#111713]">{label}</span>
                    <span className="text-xs text-[#5A7265]">{desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {serverError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
                  <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M7.5 4.5V8M7.5 10.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {serverError}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 active:scale-[0.98] transition-[background-color,transform] duration-150 disabled:opacity-50 shadow-brand mt-1">
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#5A7265]">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors duration-150">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#4A6A55] mb-1.5 uppercase tracking-wide">{label}</label>
      <input
        {...props}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#111713] placeholder-[#AABDB3] focus:outline-none focus:ring-3 transition-[border-color,box-shadow] duration-150 ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-[rgba(0,0,0,0.1)] focus:border-brand-400 focus:ring-brand-100'
          }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
