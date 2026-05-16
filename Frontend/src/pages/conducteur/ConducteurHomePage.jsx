import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMesAnnonces } from '../../api/annonceAPI'
import carImg from '../../assets/pexels-cameraman-surojit-636238129-25349389.jpg'

export default function ConducteurHomePage() {
    const [hasActive, setHasActive] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getMesAnnonces()
            .then(({ data }) => setHasActive(data.some(a => ['PUBLIEE', 'COMPLETE', 'EN_COURS'].includes(a.statut))))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen pt-[64px] bg-white">

            {/* Section 1 — Hero */}
            <div className="max-w-6xl mx-auto px-10 py-20 flex items-center gap-16">

                {/* Left — image */}
                <div className="w-[50%] shrink-0 rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    <img
                        src={carImg}
                        alt="Voiture"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center 90%' }}
                    />
                </div>

                {/* Right — text */}
                <div className="flex-1">
                    <h1 className="font-display font-bold text-[2.6rem] leading-[1.1] tracking-[-0.03em] text-[#111713] mb-5">
                        Proposez un trajet.<br />Réduisez vos frais.
                    </h1>
                    <p className="text-[#555] text-base leading-[1.75] mb-8 max-w-[480px]">
                        Faites du covoiturage en tant que conducteur et transformez vos places vides en économies réelles. Publiez votre trajet et partagez vos frais d'essence et de péage avec vos passagers.
                    </p>

                    {!loading && (
                        hasActive ? (
                            <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#F0F0EC] text-[#888] text-sm font-semibold cursor-not-allowed select-none">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                                    <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Annonce active en cours
                            </div>
                        ) : (
                            <Link
                                to="/annonces/create"
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 active:scale-[0.97] transition-[background-color,transform] duration-150"
                                style={{ boxShadow: '0 4px 20px rgba(0,133,75,0.35)' }}
                            >
                                Proposer un trajet
                            </Link>
                        )
                    )}
                </div>
            </div>

            {/* Section 2 — Comment ça marche */}
            <div className="bg-[#F7F8F6] border-t border-[rgba(0,0,0,0.06)]">
                <div className="max-w-6xl mx-auto px-10 py-20">
                    <h2 className="font-display font-bold text-[1.9rem] tracking-[-0.03em] text-[#111713] mb-2">
                        Comment ça marche ?
                    </h2>
                    <p className="text-[#666] text-sm mb-12">Trois étapes simples pour partager votre trajet.</p>

                    <div className="grid grid-cols-3 gap-8">
                        <Step

                            title="Publiez votre trajet"
                            desc="Indiquez votre départ, destination, date et nombre de places disponibles. Ça prend moins de 2 minutes."
                        // icon={
                        //     <>
                        //         <path d="M8 2C5.79 2 4 3.79 4 6c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        //         <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                        //     </>
                        // }
                        />
                        <Step
                            number="02"
                            title="Acceptez vos passagers"
                            desc="Recevez les demandes de réservation et choisissez qui monte dans votre voiture."
                            icon={
                                <>
                                    <circle cx="6.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M2 13c0-2.21 2.015-4 4.5-4s4.5 1.79 4.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M11 7.5l1.5 1.5-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </>
                            }
                        />
                        <Step
                            number="03"
                            title="Partagez les frais"
                            desc="Démarrez le trajet et profitez du voyage. Les frais sont partagés équitablement entre tous."
                            icon={
                                <>
                                    <path d="M2 11l2-5h8l2 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <rect x="1.5" y="11" width="13" height="2.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
                                    <circle cx="5" cy="13.5" r="1" fill="currentColor" />
                                    <circle cx="11" cy="13.5" r="1" fill="currentColor" />
                                    <path d="M6 8h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </>
                            }
                        />

                    </div>
                </div>
            </div>

        </div>
    )
}

function Step({ number, title, desc, icon }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                {/* <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shrink-0"
                    style={{ boxShadow: '0 2px 12px rgba(0,133,75,0.3)' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">{icon}</svg>
                </div> */}
                {/* <span className="text-[11px] font-bold text-brand-600 tracking-widest">{number}</span> */}
            </div>
            <h3 className="font-display font-bold text-[1.05rem] text-[#111713] leading-tight">{title}</h3>
            <p className="text-[#666] text-sm leading-[1.7]">{desc}</p>
        </div>
    )
}
