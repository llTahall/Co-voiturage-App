import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMesVehicules, createVehicule, deleteVehicule } from '../api/vehiculeAPI'
import { getEvaluationsForUser } from '../api/evaluationAPI'

const NAV = (isConducteur) => [
    {
        key: 'profil',
        label: 'Informations personnelles',
        desc: 'Nom, email et téléphone',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M2.5 13.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
        ),
    },
    ...(isConducteur ? [{
        key: 'vehicules',
        label: 'Mes véhicules',
        desc: 'Gérez vos véhicules enregistrés',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 10L3.5 7H12.5L14 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <rect x="1.5" y="9.5" width="13" height="2.5" rx="1.25" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="4.5" cy="12.5" r="1.25" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="11.5" cy="12.5" r="1.25" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4.5 7L6 4.5H10L11.5 7H4.5Z" fill="currentColor" fillOpacity="0.25" />
            </svg>
        ),
    }] : []),
    {
        key: 'avis',
        label: 'Avis reçus',
        desc: 'Notes et commentaires sur vous',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L9.6 5.8H13.5L10.4 8.2L11.6 12.5L8 10.1L4.4 12.5L5.6 8.2L2.5 5.8H6.4L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
        ),
    },
]

const INFO_CARDS = [
    {
        title: 'Données non affichées',
        body: 'Certaines informations personnelles ne sont pas visibles publiquement afin de protéger votre identité.',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
                <path d="M9 5.5V9.5M9 12v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        title: 'Informations modifiables',
        body: 'Vous pouvez gérer vos véhicules depuis la section dédiée. Les autres données sont liées à votre compte.',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M12 3l3 3-8 8H4v-3L12 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        title: 'Données partagées',
        body: 'Vos coordonnées ne sont partagées qu\'avec l\'autre partie qu\'après acceptation d\'une réservation.',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="5" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="14" cy="5" r="2" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="14" cy="13" r="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M7 8L12 6M7 10L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
        ),
    },
]

export default function ProfilePage() {
    const { user } = useAuth()
    const isConducteur = user?.role === 'CONDUCTEUR'
    const [active, setActive] = useState('profil')

    const nav = NAV(isConducteur)
    const currentNav = nav.find(n => n.key === active) ?? nav[0]

    return (
        <div className="min-h-screen pt-[68px] bg-white">
            <div className="max-w-[1200px] mx-auto px-8 py-12">

                <div className="flex gap-10">

                    {/* ── Sidebar ── */}
                    <aside className="w-[260px] shrink-0">
                        <h2 className="text-xl font-display font-bold text-[#111713] mb-6 px-1">Mon compte</h2>
                        <nav className="space-y-0.5">
                            {nav.map(item => {
                                const isActive = active === item.key
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => setActive(item.key)}
                                        className={`w-full text-left flex items-start gap-3.5 px-3.5 py-3.5 rounded-xl transition-[background-color] duration-150 ${isActive ? 'bg-[#F4F4F4]' : 'hover:bg-[#F9F9F7]'
                                            }`}
                                    >
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-[background-color,color] duration-150 ${isActive ? 'bg-[#111713] text-white' : 'bg-[#F0F0EC] text-[#5A7265]'
                                            }`}>
                                            {item.icon}
                                        </div>
                                        <div className="pt-0.5">
                                            <p className="text-sm font-semibold text-[#111713] leading-tight">{item.label}</p>
                                            <p className="text-[11px] text-[#8AA899] mt-0.5 leading-snug">{item.desc}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </nav>
                    </aside>

                    {/* ── Divider ── */}
                    <div className="w-px bg-[#EBEBEB] self-stretch shrink-0" />

                    {/* ── Main ── */}
                    <main className="flex-1 min-w-0">
                        <p className="text-xs text-[#8AA899] mb-5">
                            Mon compte &rsaquo; {currentNav.label}
                        </p>
                        <h1 className="text-[1.8rem] font-display font-bold text-[#111713] tracking-[-0.03em] mb-1">
                            {currentNav.label}
                        </h1>
                        <p className="text-sm text-[#5A7265] mb-10">{currentNav.desc}</p>

                        {active === 'profil' && <ProfilSection user={user} />}
                        {active === 'vehicules' && isConducteur && <VehiculesSection />}
                        {active === 'avis' && <AvisSection userId={user?.id} />}
                    </main>

                    {/* ── Right panel ── */}
                    <aside className="w-[280px] shrink-0 space-y-4">
                        {INFO_CARDS.map(card => (
                            <div key={card.title} className="rounded-2xl border border-[#EBEBEB] p-5 space-y-3">
                                <div className="w-8 h-8 rounded-lg bg-[#FFF0ED] text-[#C84B31] flex items-center justify-center">
                                    {card.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#111713] mb-1">{card.title}</p>
                                    <p className="text-[12px] text-[#5A7265] leading-relaxed">{card.body}</p>
                                </div>
                            </div>
                        ))}
                    </aside>

                </div>
            </div>
        </div>
    )
}

/* ─── Profil Section ─── */
function ProfilSection({ user }) {
    const initials = `${user?.prenom?.charAt(0) ?? ''}${user?.nom?.charAt(0) ?? ''}`.toUpperCase()

    return (
        <div className="space-y-10">

            {/* Avatar */}
            <div>
                <div className="flex items-center gap-5 mb-3">
                    <div className="w-16 h-16 rounded-full bg-[#111713] flex items-center justify-center text-white text-lg font-display font-bold shrink-0">
                        {initials}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[#111713]">Photo de profil</p>
                        <p className="text-xs text-[#8AA899] mt-0.5">Initiales générées automatiquement</p>
                    </div>
                </div>
                <div className="h-px bg-[#EBEBEB]" />
            </div>

            {/* Fields */}
            <div className="space-y-8">
                <InfoRow label="Prénom" value={user?.prenom} />
                <InfoRow label="Nom" value={user?.nom} />
                <InfoRow label="Adresse email" value={user?.email} />
                {user?.telephone && <InfoRow label="Téléphone" value={user.telephone} />}
                <div className="flex items-center justify-between py-4 border-b border-[#EBEBEB]">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1">Rôle</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-[#D5E5DC] bg-[#F0FAF4] text-[#00854B] uppercase tracking-wide">
                            {user?.role}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-[#EBEBEB]">
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1">{label}</p>
                <p className="text-sm font-medium text-[#111713]">{value ?? '—'}</p>
            </div>
        </div>
    )
}

/* ─── Véhicules Section ─── */
function VehiculesSection() {
    const [vehicules, setVehicules] = useState([])
    const [newV, setNewV] = useState({ marque: '', modele: '', couleur: '', immatriculation: '' })
    const [showForm, setShowForm] = useState(false)

    const load = () => getMesVehicules().then(({ data }) => setVehicules(data))
    useEffect(() => { load() }, [])

    const handleAdd = async () => {
        await createVehicule(newV)
        load()
        setShowForm(false)
        setNewV({ marque: '', modele: '', couleur: '', immatriculation: '' })
    }

    const handleDelete = async (id) => {
        await deleteVehicule(id)
        load()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-[#5A7265]">
                    {vehicules.length === 0
                        ? 'Aucun véhicule enregistré.'
                        : `${vehicules.length} véhicule${vehicules.length > 1 ? 's' : ''} enregistré${vehicules.length > 1 ? 's' : ''}.`}
                </p>
                <button
                    onClick={() => setShowForm(s => !s)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-[#111713] hover:text-brand-700 transition-[color] duration-150"
                >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    {showForm ? 'Annuler' : 'Ajouter un véhicule'}
                </button>
            </div>

            {showForm && (
                <div className="border border-[#EBEBEB] rounded-2xl p-6 space-y-4 bg-[#FAFAF9]">
                    <div className="grid grid-cols-2 gap-4">
                        {[['Marque', 'marque', 'ex: Toyota'], ['Modèle', 'modele', 'ex: Corolla'], ['Couleur', 'couleur', 'ex: Blanc'], ['Immatriculation', 'immatriculation', 'ex: 123-A-16']].map(([label, key, placeholder]) => (
                            <div key={key}>
                                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1.5">{label}</label>
                                <input
                                    value={newV[key]}
                                    placeholder={placeholder}
                                    onChange={e => setNewV(v => ({ ...v, [key]: e.target.value }))}
                                    className="w-full rounded-xl border border-[#DCDCDC] bg-white px-3.5 py-2.5 text-sm text-[#111713] placeholder-[#C4C4C4] focus:outline-none focus:border-[#111713] transition-[border-color] duration-150"
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleAdd}
                        className="px-5 py-2.5 rounded-xl bg-[#111713] text-white text-sm font-semibold hover:bg-[#222] active:scale-[0.97] transition-[background-color,transform] duration-150"
                    >
                        Enregistrer le véhicule
                    </button>
                </div>
            )}

            {vehicules.length > 0 && (
                <div className="space-y-0 border border-[#EBEBEB] rounded-2xl overflow-hidden divide-y divide-[#EBEBEB]">
                    {vehicules.map(v => (
                        <div key={v.id} className="flex items-center justify-between px-5 py-4 bg-white hover:bg-[#FAFAF9] transition-[background-color] duration-150">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F0F0EC] flex items-center justify-center text-[#5A7265]">
                                    <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                                        <path d="M2 9.5L3.5 6.5H12.5L14 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                        <rect x="1.5" y="9" width="13" height="2.5" rx="1.25" stroke="currentColor" strokeWidth="1.2" />
                                        <circle cx="4.5" cy="11.5" r="1" fill="currentColor" />
                                        <circle cx="11.5" cy="11.5" r="1" fill="currentColor" />
                                        <path d="M4.5 6.5L6 4H10L11.5 6.5H4.5Z" fill="currentColor" fillOpacity="0.3" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#111713]">{v.marque} {v.modele}</p>
                                    <p className="text-xs text-[#8AA899]">{v.couleur} · {v.immatriculation}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(v.id)}
                                className="text-xs font-semibold text-[#8AA899] hover:text-red-500 transition-[color] duration-150 px-2 py-1"
                            >
                                Supprimer
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

/* ─── Avis Section ─── */
function AvisSection({ userId }) {
    const [evaluations, setEvaluations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) return
        getEvaluationsForUser(userId)
            .then(({ data }) => setEvaluations(data))
            .finally(() => setLoading(false))
    }, [userId])

    const avgNote = evaluations.length
        ? (evaluations.reduce((s, e) => s + e.note, 0) / evaluations.length).toFixed(1)
        : null

    if (loading) {
        return (
            <div className="flex items-center gap-3 text-[#8AA899] text-sm">
                <div className="w-4 h-4 rounded-full border-2 border-[#DCDCDC] border-t-[#111713] animate-spin" />
                Chargement…
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {avgNote && (
                <div className="flex items-center gap-4 pb-6 border-b border-[#EBEBEB]">
                    <p className="text-5xl font-display font-bold text-[#111713]">{avgNote}</p>
                    <div>
                        <div className="flex gap-1 mb-1">
                            {Array.from({ length: 5 }, (_, i) => (
                                <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M7 1.5L8.5 5H12.5L9.2 7.3L10.5 11.5L7 9.1L3.5 11.5L4.8 7.3L1.5 5H5.5L7 1.5Z"
                                        fill={i < Math.round(parseFloat(avgNote)) ? '#111713' : '#E0E0DC'} />
                                </svg>
                            ))}
                        </div>
                        <p className="text-xs text-[#8AA899]">{evaluations.length} avis reçu{evaluations.length > 1 ? 's' : ''}</p>
                    </div>
                </div>
            )}

            {evaluations.length === 0 ? (
                <p className="text-sm text-[#8AA899]">Aucun avis pour l'instant.</p>
            ) : (
                <div className="space-y-0 border border-[#EBEBEB] rounded-2xl overflow-hidden divide-y divide-[#EBEBEB]">
                    {evaluations.map(e => (
                        <div key={e.id} className="px-5 py-4 bg-white">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-[#111713]">
                                    {e.emetteur?.prenom} {e.emetteur?.nom?.charAt(0)}.
                                </p>
                                <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M6 1L7.3 4.3H11L8.2 6.3L9.3 10L6 7.9L2.7 10L3.8 6.3L1 4.3H4.7L6 1Z"
                                                fill={i < e.note ? '#111713' : '#E0E0DC'} />
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
        </div>
    )
}
