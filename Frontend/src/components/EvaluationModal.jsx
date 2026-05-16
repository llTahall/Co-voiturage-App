import { useState } from 'react'
import { createEvaluation } from '../api/evaluationAPI'

export default function EvaluationModal({ reservation, destinataireId, destinataireName, queueInfo, onClose, onDone }) {
    const [note, setNote] = useState(0)
    const [hovered, setHovered] = useState(0)
    const [commentaire, setCommentaire] = useState('')
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState('')

    const villeDepart = reservation?.annonce?.trajet?.villeDepart ?? '—'
    const villeArrivee = reservation?.annonce?.trajet?.villeArrivee ?? '—'

    const handleSubmit = async () => {
        if (note === 0) { setError('Veuillez sélectionner une note.'); return }
        setSaving(true)
        setError('')
        try {
            await createEvaluation({
                reservationId: reservation.id,
                destinataireId,
                note,
                commentaire: commentaire.trim() || null,
            })
            setDone(true)
            setTimeout(() => onDone(), 1800)
        } catch (e) {
            setError(e.response?.data?.message || 'Erreur lors de l\'envoi.')
        } finally {
            setSaving(false)
        }
    }

    const displayed = hovered || note

    const labels = ['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent']

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Top accent bar */}
                <div className="h-1 bg-brand-600 w-full" />

                <div className="px-8 py-7">
                    {/* Success state */}
                    {done && (
                        <div className="flex flex-col items-center justify-center py-6 gap-4">
                            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                    <circle cx="16" cy="16" r="15" stroke="#00854B" strokeWidth="1.5" />
                                    <path d="M9 16.5l5 5 9-9" stroke="#00854B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="text-base font-display font-bold text-[#111713]">Avis envoyé !</p>
                                <p className="text-sm text-[#8AA899] mt-1">{destinataireName} a été notifié(e).</p>
                            </div>
                        </div>
                    )}
                    {done ? null : <>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            {queueInfo && (
                                <p className="text-[11px] font-semibold text-brand-600 mb-1">
                                    Passager {queueInfo.current} / {queueInfo.total}
                                </p>
                            )}
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8AA899] mb-1">Évaluation du trajet</p>
                            <div className="flex items-center gap-2 text-base font-display font-bold text-[#111713]">
                                <span>{villeDepart}</span>
                                <svg width="14" height="8" viewBox="0 0 14 8" fill="none" className="text-brand-500 shrink-0">
                                    <path d="M1 4h11M8 1l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>{villeArrivee}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#AAA] hover:text-[#555] hover:bg-[#F0F0EC] transition-[color,background-color] duration-150"
                        >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    {/* Person being evaluated */}
                    <div className="flex items-center gap-3 bg-[#F7F9F8] rounded-2xl px-4 py-3 mb-7">
                        <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold uppercase shrink-0">
                            {destinataireName?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                            <p className="text-xs text-[#8AA899] font-medium">Vous évaluez</p>
                            <p className="text-sm font-semibold text-[#111713]">{destinataireName}</p>
                        </div>
                    </div>

                    {/* Stars */}
                    <div className="text-center mb-2">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8AA899] mb-4">Note</p>
                        <div className="flex justify-center gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <button
                                    key={i}
                                    onMouseEnter={() => setHovered(i)}
                                    onMouseLeave={() => setHovered(0)}
                                    onClick={() => setNote(i)}
                                    className="group transition-[transform] duration-100 active:scale-90"
                                >
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2Z"
                                            fill={i <= displayed ? '#00854B' : '#E5EDE9'}
                                            stroke={i <= displayed ? '#00854B' : '#D0DDD6'}
                                            strokeWidth="0.5"
                                            className="transition-[fill,stroke] duration-150"
                                        />
                                    </svg>
                                </button>
                            ))}
                        </div>
                        <p className={`text-sm font-semibold transition-[color,opacity] duration-150 h-5 ${displayed ? 'text-brand-600 opacity-100' : 'opacity-0'}`}>
                            {labels[displayed]}
                        </p>
                    </div>

                    {/* Comment */}
                    <div className="mt-5">
                        <label className="text-[11px] font-semibold uppercase tracking-widest text-[#8AA899] block mb-2">
                            Commentaire <span className="normal-case font-normal text-[#B0C4BA]">(optionnel)</span>
                        </label>
                        <textarea
                            value={commentaire}
                            onChange={e => setCommentaire(e.target.value)}
                            rows={3}
                            placeholder="Décrivez votre expérience…"
                            maxLength={500}
                            className="w-full rounded-xl border border-[#DCDCDC] px-3.5 py-2.5 text-sm text-[#111713] placeholder-[#C4C4C4] focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none transition-[border-color] duration-150"
                        />
                        <p className="text-[10px] text-[#C4C4C4] text-right mt-1">{commentaire.length}/500</p>
                    </div>

                    {error && (
                        <p className="text-xs text-red-500 mt-2">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-[#DCDCDC] text-sm font-semibold text-[#666] hover:border-[#999] transition-[border-color] duration-150"
                        >
                            Plus tard
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving || note === 0}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 active:scale-[0.97] transition-[background-color,transform] duration-150 disabled:opacity-50"
                            style={{ boxShadow: '0 2px 12px rgba(0,133,75,0.25)' }}
                        >
                            {saving ? 'Envoi…' : 'Soumettre'}
                        </button>
                    </div>
                    </>}
                </div>
            </div>
        </div>
    )
}
