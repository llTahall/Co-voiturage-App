import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMesVehicules, createVehicule, deleteVehicule } from '../api/vehiculeAPI'
import { getEvaluationsForUser } from '../api/evaluationAPI'
import { updateProfile } from '../api/userAPI'

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

export default function ProfilePage() {
    const { user } = useAuth()
    const isConducteur = user?.role === 'CONDUCTEUR'
    const [active, setActive] = useState('profil')

    const nav = NAV(isConducteur)
    const currentNav = nav.find(n => n.key === active) ?? nav[0]

    return (
        <div className="min-h-screen pt-[68px] bg-white">
            <div className="max-w-[900px] mx-auto px-8 py-12">
                <div className="flex gap-10">

                    {/* Sidebar */}
                    <aside className="w-[260px] shrink-0">
                        <h2 className="text-xl font-display font-bold text-[#111713] mb-6 px-1">Mon compte</h2>
                        <nav className="space-y-0.5">
                            {nav.map(item => {
                                const isActive = active === item.key
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => setActive(item.key)}
                                        className={`w-full text-left flex items-start gap-3.5 px-3.5 py-3.5 rounded-xl transition-[background-color] duration-150 ${isActive ? 'bg-brand-50' : 'hover:bg-[#F9F9F7]'}`}
                                    >
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-[background-color,color] duration-150 ${isActive ? 'bg-brand-600 text-white' : 'bg-[#F0F0EC] text-[#5A7265]'}`}>
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

                    {/* Divider */}
                    <div className="w-px bg-[#EBEBEB] self-stretch shrink-0" />

                    {/* Main */}
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
                </div>
            </div>
        </div>
    )
}

/* ─── Profil Section ─── */
function ProfilSection({ user }) {
    const { updateUser } = useAuth()
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [phoneError, setPhoneError] = useState('')
    const [form, setForm] = useState({
        prenom: user?.prenom ?? '',
        nom: user?.nom ?? '',
        telephone: user?.telephone ?? '',
    })

    // Resync quand user change (après un save)
    useEffect(() => {
        if (!editing) {
            setForm({
                prenom: user?.prenom ?? '',
                nom: user?.nom ?? '',
                telephone: user?.telephone ?? '',
            })
        }
    }, [user?.prenom, user?.nom, user?.telephone])

    const initials = `${user?.prenom?.charAt(0) ?? ''}${user?.nom?.charAt(0) ?? ''}`.toUpperCase()

    const validatePhone = (val) => {
        if (!val) return ''
        return /^[+\d][\d\s\-().]{6,14}$/.test(val) ? '' : 'Format invalide (ex: +212 6XX XXX XXX)'
    }

    const handlePhoneChange = (val) => {
        // Refuse les lettres
        if (/[a-zA-Z]/.test(val)) return
        setForm(f => ({ ...f, telephone: val }))
        setPhoneError(validatePhone(val))
    }

    const handleSave = async () => {
        const err = validatePhone(form.telephone)
        if (err) { setPhoneError(err); return }
        setSaving(true)
        try {
            const { data } = await updateProfile(form)
            if (typeof updateUser === 'function') updateUser(data)
            setSaved(true)
            setEditing(false)
            setTimeout(() => setSaved(false), 3000)
        } catch (e) {
            alert(e.response?.data?.message || 'Erreur lors de la sauvegarde')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setForm({ prenom: user?.prenom ?? '', nom: user?.nom ?? '', telephone: user?.telephone ?? '' })
        setPhoneError('')
        setEditing(false)
    }

    return (
        <div className="space-y-10">

            {/* Avatar */}
            <div>
                <div className="flex items-center gap-5 mb-3">
                    <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-lg font-display font-bold shrink-0">
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
            <div className="space-y-0">
                <FieldRow label="Prénom" editing={editing}
                    value={user?.prenom}
                    input={<Input value={form.prenom} onChange={v => setForm(f => ({ ...f, prenom: v }))} />}
                />
                <FieldRow label="Nom" editing={editing}
                    value={user?.nom}
                    input={<Input value={form.nom} onChange={v => setForm(f => ({ ...f, nom: v }))} />}
                />
                <FieldRow label="Téléphone" editing={editing}
                    value={user?.telephone || '—'}
                    input={
                        <div>
                            <Input value={form.telephone} onChange={handlePhoneChange} placeholder="+212 6XX XXX XXX" error={!!phoneError} />
                            {phoneError && <p className="text-[11px] text-red-500 mt-1">{phoneError}</p>}
                        </div>
                    }
                />
                <ReadRow label="Adresse email" value={user?.email} />
                <div className="flex items-center justify-between py-4 border-b border-[#EBEBEB]">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1">Rôle</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-brand-200 bg-brand-50 text-brand-700 uppercase tracking-wide">
                            {user?.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
                {!editing ? (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 active:scale-[0.97] transition-[background-color,transform] duration-150"
                        style={{ boxShadow: '0 2px 12px rgba(0,133,75,0.3)' }}
                    >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M9 1.5l2.5 2.5-7 7H2V8.5l7-7Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
                        </svg>
                        Modifier
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleSave}
                            disabled={saving || !!phoneError}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 active:scale-[0.97] transition-[background-color,transform] duration-150 disabled:opacity-60"
                            style={{ boxShadow: '0 2px 12px rgba(0,133,75,0.3)' }}
                        >
                            {saving ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-5 py-2.5 rounded-xl border border-[#DCDCDC] text-sm font-semibold text-[#666] hover:border-[#999] transition-[border-color] duration-150"
                        >
                            Annuler
                        </button>
                    </>
                )}
                {saved && (
                    <span className="text-sm text-brand-600 font-semibold flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M4.5 7l2 2 3-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Modifications enregistrées
                    </span>
                )}
            </div>
        </div>
    )
}


function FieldRow({ label, value, editing, input }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-[#EBEBEB] gap-6">
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1">{label}</p>
                {editing ? input : <p className="text-sm font-medium text-[#111713]">{value ?? '—'}</p>}
            </div>
        </div>
    )
}

function ReadRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-[#EBEBEB]">
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1">{label}</p>
                <p className="text-sm font-medium text-[#111713]">{value ?? '—'}</p>
            </div>
            <span className="text-[11px] text-[#C4C4C4] font-medium">Non modifiable</span>
        </div>
    )
}

function Input({ value, onChange, placeholder, error }) {
    return (
        <input
            value={value}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            className={`w-full max-w-[320px] rounded-xl border px-3.5 py-2 text-sm text-[#111713] placeholder-[#C4C4C4] focus:outline-none focus:ring-2 transition-[border-color] duration-150 ${error
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                    : 'border-[#DCDCDC] focus:border-brand-500 focus:ring-brand-100'
                }`}
        />
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
                    className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-[color] duration-150"
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
                                    className="w-full rounded-xl border border-[#DCDCDC] bg-white px-3.5 py-2.5 text-sm text-[#111713] placeholder-[#C4C4C4] focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-[border-color] duration-150"
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleAdd}
                        className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:scale-[0.97] transition-[background-color,transform] duration-150"
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
                                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
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

    if (loading) return (
        <div className="flex items-center gap-3 text-[#8AA899] text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
            Chargement…
        </div>
    )

    return (
        <div className="min-h-screen pt-[68px] bg-white flex">

            {/* Sidebar — flush left */}
            <aside className="w-[260px] shrink-0 border-r border-[#EBEBEB] px-8 py-12">
                <h2 className="text-xl font-display font-bold text-[#111713] mb-6">Mon compte</h2>
                <nav className="space-y-0.5">
                    {nav.map(item => {
                        const isActive = active === item.key
                        return (
                            <button
                                key={item.key}
                                onClick={() => setActive(item.key)}
                                className={`w-full text-left flex items-start gap-3.5 px-3.5 py-3.5 rounded-xl transition-[background-color] duration-150 ${isActive ? 'bg-brand-50' : 'hover:bg-[#F9F9F7]'}`}
                            >
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-[background-color,color] duration-150 ${isActive ? 'bg-brand-600 text-white' : 'bg-[#F0F0EC] text-[#5A7265]'}`}>
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

            {/* Main — centré dans l'espace restant */}
            <main className="flex-1 flex justify-center px-12 py-12">
                <div className="w-full max-w-[580px]">
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
                </div>
            </main>
        </div>
    )

}
