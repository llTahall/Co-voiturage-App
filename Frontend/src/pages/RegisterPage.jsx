import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../api/axiosConfig'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', motDePasse: '', telephone: '', role: 'PASSAGER'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axiosInstance.post('/api/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const field = (label, key, type = 'text', required = true) => (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      <input
        type={type} required={required} value={form[key]} onChange={set(key)}
        className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  )

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl mb-2">Inscription</h1>
        <p className="text-stone-500 mb-8">Rejoignez la communauté CoVoiture.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field('Prénom', 'prenom')}
            {field('Nom', 'nom')}
          </div>
          {field('Email', 'email', 'email')}
          {field('Mot de passe', 'motDePasse', 'password')}
          {field('Téléphone', 'telephone', 'tel', false)}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Rôle</label>
            <select
              value={form.role} onChange={set('role')}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400"
            >
              <option value="PASSAGER">Passager</option>
              <option value="CONDUCTEUR">Conducteur</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 text-white font-medium
              hover:bg-brand-700 active:scale-[0.98] transition-[transform,background-color] duration-150
              disabled:opacity-50"
          >
            {loading ? 'Inscription…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-brand-600 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
