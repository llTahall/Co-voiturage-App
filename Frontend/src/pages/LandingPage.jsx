import { Link } from 'react-router-dom'
import carImg from '../assets/pexels-aswin-33661771.jpg'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#FFFAF0] flex flex-col">

            {/* Nav */}
            <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-10 px-10 py-6">
                <Link to="/search" className="text-sm font-semibold text-[#6B6640] hover:text-[#2A2810] transition-[color] duration-150">
                    Rechercher
                </Link>
                <Link to="/login" className="text-sm font-semibold text-[#6B6640] hover:text-[#2A2810] transition-[color] duration-150">
                    Connexion
                </Link>
                <Link to="/register" className="px-5 py-2 rounded-full bg-[#00854B] text-white text-sm font-bold hover:bg-[#006D3D] active:scale-[0.97] transition-[background-color,transform] duration-150">
                    S'inscrire
                </Link>
            </nav>

            {/* Hero */}
            <div className="flex-1 flex">

                {/* Left — content */}
                <div className="flex-1 flex flex-col justify-center px-10 md:px-16 lg:px-24 pt-20 pb-16">
                    <div className="max-w-[520px]">



                        <h1 className="font-display font-extrabold text-[#1E1C08] leading-[0.95] tracking-[-0.04em] text-[4rem] md:text-[5rem] lg:text-[5.5rem] mb-8">
                            Partagez<br />
                            la route.<br />
                            <span className="text-[#00854B]">Économisez.</span>
                        </h1>

                        <p className="text-[#6B6640] text-base leading-relaxed mb-12 max-w-[380px]">
                            Trajets entre villes marocaines. Sans commission, sans intermédiaire.
                            Directement entre conducteurs et passagers.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to="/register"
                                className="group inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-[#00854B] text-white text-sm font-bold hover:bg-[#006D3D] active:scale-[0.97] transition-[background-color,transform] duration-150"
                            >
                                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                        <path d="M2 9.5L3.5 7H9.5L11 9.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                                        <rect x="1.5" y="9" width="10" height="2" rx="1" fill="white" fillOpacity="0.9" />
                                        <circle cx="4" cy="11.5" r="0.9" fill="white" />
                                        <circle cx="9" cy="11.5" r="0.9" fill="white" />
                                    </svg>
                                </div>
                                Je suis conducteur
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-auto opacity-60 group-hover:translate-x-0.5 transition-[transform] duration-150">
                                    <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>

                            <Link to="/register"
                                className="group inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl border border-[#2A2810]/15 text-[#1E1C08] text-sm font-bold hover:border-[#2A2810]/30 hover:bg-[#2A2810]/5 active:scale-[0.97] transition-[border-color,background-color,transform] duration-150"
                            >
                                <div className="w-6 h-6 rounded-lg bg-[#2A2810]/8 flex items-center justify-center shrink-0">
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                        <circle cx="6.5" cy="4.5" r="2.5" stroke="#1E1C08" strokeWidth="1.3" />
                                        <path d="M1.5 11.5c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#1E1C08" strokeWidth="1.3" strokeLinecap="round" />
                                    </svg>
                                </div>
                                Je cherche un trajet
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-auto opacity-30 group-hover:translate-x-0.5 transition-[transform] duration-150">
                                    <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>
                        </div>

                        {/* Stats
                        <div className="flex items-center gap-6 mt-14 pt-8 border-t border-[#2A2810]/10">
                            {[
                                { val: '2k+', label: 'Trajets' },
                                { val: '4.8', label: 'Note moyenne' },
                                { val: '100%', label: 'Gratuit' },
                            ].map(({ val, label }) => (
                                <div key={label}>
                                    <p className="text-[#1E1C08] font-display font-bold text-xl tracking-[-0.03em]">{val}</p>
                                    <p className="text-[#8A845A] text-[11px] font-medium mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div> */}
                    </div>
                </div>

                {/* Right — car image */}
                <div className="hidden lg:block w-[45%] relative overflow-hidden">
                    <img src={carImg} alt="Voiture" className="absolute inset-0 w-full h-full object-cover object-center" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFFAF0] via-[#FFFAF0]/15 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FFFAF0] via-transparent to-[#FFFAF0]/30" />
                </div>
            </div>
        </div>
    )
}
