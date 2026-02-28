import React from 'react';
import { useNavigate } from 'react-router-dom';
import DataGridBackground from '../components/DataGridBackground';
import { motion } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen text-forensic-text font-mono selection:bg-forensic-emerald/30">
            {/* High-Tech Background Canvas */}
            <DataGridBackground />

            {/* Sharp Navigation Bar */}
            <nav className="absolute top-0 w-full p-6 z-10 flex justify-between items-center bg-forensic-black/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-forensic-charcoal border border-forensic-emerald flex items-center justify-center neon-glow-emerald">
                        <Shield className="w-5 h-5 text-forensic-emerald" />
                    </div>
                    <span className="text-xl font-bold tracking-widest text-white uppercase font-sans">
                        Truth<span className="text-forensic-emerald">Triage</span>
                    </span>
                </div>
                <button
                    className="px-6 py-2 border border-white/20 hover:border-forensic-violet hover:text-forensic-violet transition-colors text-xs font-semibold uppercase tracking-widest bg-forensic-surface/50"
                >
                    System Auth
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-4xl"
                >
                    <div className="inline-flex items-center gap-3 px-5 py-2 border border-forensic-emerald/30 bg-forensic-emerald-dim text-forensic-emerald text-xs tracking-[0.2em] mb-8 uppercase">
                        <span className="w-2 h-2 bg-forensic-emerald animate-pulse-fast" />
                        Terminal Access Granted
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white leading-tight uppercase font-sans">
                        Verify Before <br />
                        <span className="text-gradient-forensic">You Trust [.]</span>
                    </h1>

                    <p className="text-sm md:text-base text-forensic-muted mb-12 max-w-2xl mx-auto leading-relaxed text-left inline-block bg-forensic-charcoal/50 p-6 border border-white/5">
                        <span className="text-forensic-emerald">&gt;</span> Initializing intelligence dashboard...<br />
                        <span className="text-forensic-emerald">&gt;</span> Analyzing cross-reference data...<br />
                        <span className="text-forensic-emerald">&gt;</span> System ready for input.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/verify')}
                            className="group relative flex items-center gap-3 px-8 py-4 bg-forensic-violet text-white font-bold text-sm tracking-widest uppercase hover:bg-violet-600 transition-colors duration-300 border border-violet-400/50 neon-glow-violet"
                        >
                            Init Verification
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                        <button className="px-8 py-4 border border-white/20 hover:border-forensic-emerald hover:text-forensic-emerald transition-colors text-white font-bold text-sm tracking-widest uppercase bg-forensic-surface/50">
                            View Architecture
                        </button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default HomePage;
