import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMesVehicules, createVehicule, deleteVehicule } from '../api/vehiculeAPI'
import { getEvaluationsForUser } from '../api/evaluationAPI'

export default function ProfilePage() {
  const { user } = useAuth()
  const [vehicules, setVehicules] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [newV, setNewV] = useState({ marque: '', modele: '', couleur: '', immatriculation: '' })
  const [showForm, setShowForm] = useState(false)

  const loadVehicules = () => getMesVehicules().then(({ data }) => setVehicules(data))
  const loadEvals = () => getEvaluationsForUser(user.id).then(({ data }) => setEvaluations(data))

  useEffect(() => {
    loadVehicules()
    loadEvals()
  }, [])

  const handleAdd = async () => {
    await createVehicule(newV)
    loadVehicules()
    setShowForm(false)
    setNewV({ marque: '', modele: '', couleur: '', immatriculation: '' })
  }

  const handleDelete = async (id) => {
    await deleteVehicule(id)
    loadVehicules()
  }

  const avgNote = evaluations.length
    ? (evaluations.reduce((s, e) => s + e.note, 0) / evaluations.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen pt-24 max-w-3xl mx-auto px-6 py-12 space-y-12">
      {/* Profile header */}
      <section className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-3xl font-display text-brand-700">
          {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
        </div>
        <div>
          <h1 className="text-4xl">{user?.prenom} {user?.nom}</h1>
          <p className="text-stone-500 text-sm mt-1">{user?.email} · {user?.telephone}</p>
          <p className="text-sm mt-1">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
              {user?.role}
            </span>
            {avgNote && (
              <span className="ml-2 text-stone-500">⭐ {avgNote} / 5 ({evaluations.length} avis)</span>
            )}
          </p>
        </div>
      </section>

      {/* Vehicles */}
      {user?.role === 'CONDUCTEUR' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display">Mes véhicules</h2>
            <button onClick={() => setShowForm(s => !s)}
              className="text-sm text-brand-600 hover:underline">
              + Ajouter
            </button>
          </div>

          {showForm && (
            <div className="grid grid-cols-2 gap-3 p-4 bg-stone-50 rounded-xl">
              {[['Marque','marque'],['Modèle','modele'],['Couleur','couleur'],['Immatriculation','immatriculation']].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
                  <input value={newV[key]}
                    onChange={e => setNewV(v => ({ ...v, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <button onClick={handleAdd}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm hover:bg-brand-700 transition-colors duration-150">
                  Sauvegarder
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {vehicules.map(v => (
              <div key={v.id}
                className="flex items-center justify-between bg-white border border-stone-200 rounded-xl px-5 py-3">
                <span className="text-sm">{v.couleur} · {v.marque} {v.modele} — {v.immatriculation}</span>
                <button onClick={() => handleDelete(v.id)}
                  className="text-xs text-stone-400 hover:text-red-500 transition-colors duration-150">
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Evaluations */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display">Avis reçus</h2>
        {evaluations.length === 0 ? (
          <p className="text-stone-400 text-sm">Aucun avis pour l'instant.</p>
        ) : (
          <div className="space-y-3">
            {evaluations.map(e => (
              <div key={e.id} className="bg-white border border-stone-200 rounded-xl p-5 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{e.emetteur?.prenom} {e.emetteur?.nom?.charAt(0)}.</span>
                  <span className="text-brand-500">{'★'.repeat(e.note)}{'☆'.repeat(5 - e.note)}</span>
                </div>
                {e.commentaire && <p className="text-sm text-stone-600">{e.commentaire}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
