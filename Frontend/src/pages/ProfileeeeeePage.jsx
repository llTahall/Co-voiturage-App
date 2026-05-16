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
  const loadEvals    = () => getEvaluationsForUser(user.id).then(({ data }) => setEvaluations(data))

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

  const initials = `${user?.prenom?.charAt(0) ?? ''}${user?.nom?.charAt(0) ?? ''}`.toUpperCase()

  return (
    <div className="min-h-screen pt-[68px] bg-[#F7F7F4]">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] shadow-card p-7">
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-white shadow-brand"
              style={{ background: 'linear-gradient(135deg, #059154 0%, #32ce87 100%)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-display font-bold text-[#111713] truncate">
                {user?.prenom} {user?.nom}
              </h1>
              <p className="text-sm text-[#5A7265] mt-0.5 truncate">{user?.email}</p>
              {user?.telephone && (
                <p className="text-sm text-[#5A7265] truncate">{user?.telephone}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200 uppercase tracking-wide">
                  {user?.role}
                </span>
                {avgNote && (
                  <span className="text-sm text-[#5A7265]">
                    ⭐ <strong className="text-[#111713]">{avgNote}</strong>
                    <span className="text-[#8AA899] ml-1">/ 5 ({evaluations.length} avis)</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles section */}
        {user?.role === 'CONDUCTEUR' && (
          <section className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] shadow-card p-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-[#111713]">Mes véhicules</h2>
              <button
                onClick={() => setShowForm(s => !s)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-[background-color] duration-150"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                {showForm ? 'Annuler' : 'Ajouter'}
              </button>
            </div>

            {showForm && (
              <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F7F7F4] p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[['Marque','marque','ex: Toyota'],['Modèle','modele','ex: Corolla'],['Couleur','couleur','ex: Blanc'],['Immatriculation','immatriculation','ex: 123-ALG-16']].map(([label, key, placeholder]) => (
                    <div key={key}>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1.5">{label}</label>
                      <input
                        value={newV[key]}
                        placeholder={placeholder}
                        onChange={e => setNewV(v => ({ ...v, [key]: e.target.value }))}
                        className="w-full rounded-xl border border-[rgba(0,0,0,0.1)] bg-white px-3.5 py-2.5 text-sm text-[#111713] placeholder-[#AABDB3] focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-[border-color] duration-150"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAdd}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 active:scale-[0.97] transition-[background-color,transform] duration-150 shadow-brand"
                >
                  Ajouter le véhicule
                </button>
              </div>
            )}

            {vehicules.length === 0 ? (
              <p className="text-[#8AA899] text-sm">Aucun véhicule enregistré.</p>
            ) : (
              <div className="space-y-2">
                {vehicules.map(v => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-xl border border-[rgba(0,0,0,0.07)] bg-[#F9F9F7] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                        <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                          <path d="M2 9.5L3.5 6.5H12.5L14 9.5" stroke="#059154" strokeWidth="1.2" strokeLinecap="round"/>
                          <rect x="1.5" y="9" width="13" height="2.5" rx="1.25" stroke="#059154" strokeWidth="1.2"/>
                          <circle cx="4.5" cy="11.5" r="1" fill="#059154"/>
                          <circle cx="11.5" cy="11.5" r="1" fill="#059154"/>
                          <path d="M4.5 6.5L6 4H10L11.5 6.5H4.5Z" fill="#059154" fillOpacity="0.3"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-[#111713]">
                        {v.marque} {v.modele}
                        <span className="text-[#5A7265] font-normal"> · {v.couleur} · {v.immatriculation}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-xs text-[#8AA899] hover:text-red-500 transition-[color] duration-150 font-medium px-2 py-1"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Evaluations */}
        <section className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] shadow-card p-7 space-y-5">
          <h2 className="text-xl font-display font-bold text-[#111713]">Avis reçus</h2>

          {evaluations.length === 0 ? (
            <p className="text-[#8AA899] text-sm">Aucun avis pour l'instant.</p>
          ) : (
            <div className="space-y-3">
              {evaluations.map(e => (
                <div key={e.id} className="rounded-xl border border-[rgba(0,0,0,0.07)] bg-[#F9F9F7] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#111713]">
                      {e.emetteur?.prenom} {e.emetteur?.nom?.charAt(0)}.
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg key={i} width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path
                            d="M6.5 1.5L7.9 5H11.5L8.6 7.3L9.7 11L6.5 8.9L3.3 11L4.4 7.3L1.5 5H5.1L6.5 1.5Z"
                            fill={i < e.note ? '#059154' : '#E0EAE5'}
                          />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {e.commentaire && (
                    <p className="text-sm text-[#5A7265] leading-relaxed">{e.commentaire}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
