import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertCircle, FileText, Activity, MapPin, Pill, BarChart3 } from 'lucide-react';
import DoctorMap from './DoctorMap';

const RightPanel = ({ isOpen, activeSources, confidence, riskLevel, doctors, specialization, doctorLocation, medicines }) => {
    const [activeTab, setActiveTab] = useState('telemetry');

    if (!isOpen) return null;

    const getRiskColor = (level) => {
        switch (level) {
            case 'High': return 'text-forensic-crimson border-forensic-crimson bg-forensic-crimson-dim neon-glow-crimson';
            case 'Medium': return 'text-amber-500 border-amber-500 bg-amber-500/10';
            case 'Low': return 'text-forensic-emerald border-forensic-emerald bg-forensic-emerald-dim neon-glow-emerald';
            default: return 'text-forensic-muted border-white/20 bg-forensic-surface/50';
        }
    };

    const tabs = [
        { id: 'telemetry', label: 'TELEMETRY', icon: Activity },
        { id: 'doctors', label: 'DOCTORS', icon: MapPin },
        { id: 'medicines', label: 'MEDICINES', icon: Pill },
    ];

    return (
        <div className="w-80 h-full border-l border-white/10 tech-panel overflow-y-auto flex flex-col">
            {/* Tab Bar */}
            <div className="flex border-b border-white/10">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 text-[10px] font-mono uppercase tracking-widest flex items-center justify-center gap-1 transition-all border-b-2 ${activeTab === tab.id
                                ? 'text-forensic-cyan border-forensic-cyan bg-forensic-cyan/5'
                                : 'text-forensic-muted border-transparent hover:text-forensic-text hover:bg-white/5'
                            }`}
                    >
                        <tab.icon className="w-3 h-3" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-4 space-y-6 flex-1">
                {/* Telemetry Tab */}
                {activeTab === 'telemetry' && (
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            {/* Confidence */}
                            <div className="p-4 bg-forensic-charcoal border border-forensic-violet/30 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-forensic-violet/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex justify-between items-center mb-2 relative z-10">
                                    <span className="terminal-text text-[10px] text-forensic-violet">CONFIDENCE_MTX</span>
                                    <span className="text-xl font-bold text-forensic-violet font-mono">{confidence}%</span>
                                </div>
                                <div className="h-2 w-full bg-forensic-black border border-white/10 relative z-10">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${confidence}%` }}
                                        className="h-full bg-forensic-violet neon-glow-violet"
                                    />
                                </div>
                            </div>

                            {/* Risk */}
                            <div className={`p-4 border flex items-center gap-3 ${getRiskColor(riskLevel)}`}>
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <p className="terminal-text text-[10px] opacity-80 !text-inherit">RISK_ASSESSMENT</p>
                                    <p className="font-mono font-bold uppercase tracking-widest text-sm">{riskLevel || "UNKNOWN"} RISK</p>
                                </div>
                            </div>

                            {/* Sources with Similarity Scores */}
                            <div className="flex-1">
                                <h3 className="terminal-text mb-4 text-forensic-cyan mt-4 flex items-center gap-2">
                                    <BarChart3 className="w-3 h-3" />
                                    EXTRACTED_VECTORS
                                </h3>
                                <ul className="space-y-3">
                                    <AnimatePresence>
                                        {activeSources && activeSources.length > 0 ? activeSources.map((source, idx) => (
                                            <motion.li
                                                key={idx}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-3 bg-forensic-surface border border-white/10 hover:border-forensic-cyan transition-colors cursor-pointer group relative overflow-hidden"
                                            >
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-forensic-cyan scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>

                                                <div className="flex gap-2 items-start mb-1">
                                                    <FileText className="w-4 h-4 text-forensic-cyan mt-0.5" />
                                                    <span className="text-xs font-mono font-bold text-forensic-text group-hover:text-forensic-cyan transition-colors line-clamp-1 uppercase tracking-wider">
                                                        {source.metadata?.source || "Unidentified_Node"}
                                                    </span>
                                                </div>

                                                {/* Similarity Score Bar */}
                                                {source.similarity_score != null && (
                                                    <div className="pl-6 mt-2">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-[10px] font-mono text-forensic-muted">SIMILARITY</span>
                                                            <span className={`text-[10px] font-mono font-bold ${source.similarity_score > 0.7 ? 'text-forensic-emerald' :
                                                                    source.similarity_score > 0.4 ? 'text-amber-500' : 'text-forensic-crimson'
                                                                }`}>
                                                                {(source.similarity_score * 100).toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div className="h-1 w-full bg-forensic-black border border-white/5">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${source.similarity_score * 100}%` }}
                                                                className={`h-full ${source.similarity_score > 0.7 ? 'bg-forensic-emerald' :
                                                                        source.similarity_score > 0.4 ? 'bg-amber-500' : 'bg-forensic-crimson'
                                                                    }`}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="text-xs text-forensic-muted line-clamp-3 pl-6 font-sans mt-2">
                                                    "{source.content}"
                                                </div>
                                                {source.metadata?.page && (
                                                    <div className="mt-3 pl-6 flex justify-between items-center">
                                                        <span className="text-[10px] px-2 py-0.5 border border-forensic-cyan/30 text-forensic-cyan font-mono bg-forensic-cyan/10 uppercase">
                                                            INDEX: {source.metadata.page}
                                                        </span>
                                                        <span className="text-[10px] text-forensic-muted font-mono">VERIFIED</span>
                                                    </div>
                                                )}
                                            </motion.li>
                                        )) : (
                                            <div className="text-xs font-mono text-forensic-muted italic p-4 text-center border border-dashed border-white/10 bg-forensic-surface/30 uppercase tracking-widest">
                                                0 Nodes Connected
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </ul>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* Doctors Tab */}
                {activeTab === 'doctors' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <DoctorMap
                            doctors={doctors || []}
                            specialization={specialization}
                            location={doctorLocation}
                        />
                    </motion.div>
                )}

                {/* Medicines Tab */}
                {activeTab === 'medicines' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                            <Pill className="w-4 h-4 text-forensic-violet" />
                            <span className="terminal-text text-forensic-violet">MEDICINE_SUGGESTIONS</span>
                        </div>
                        {medicines && medicines.length > 0 ? (
                            medicines.map((med, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-3 bg-forensic-surface border border-white/10 hover:border-forensic-violet transition-colors group"
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="text-lg">💊</span>
                                        <div>
                                            <h4 className="text-sm font-bold text-forensic-text group-hover:text-forensic-violet transition-colors">
                                                {med.name}
                                            </h4>
                                            <p className="text-xs text-forensic-muted mt-1 font-sans">
                                                {med.usage}
                                            </p>
                                            {med.source && (
                                                <span className="text-[10px] text-forensic-cyan font-mono mt-2 inline-block">
                                                    SRC: {med.source}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-xs font-mono text-forensic-muted italic p-4 text-center border border-dashed border-white/10 bg-forensic-surface/30 uppercase tracking-widest">
                                No medicines identified
                            </div>
                        )}
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 mt-4">
                            <p className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">
                                ⚠️ DISCLAIMER: Always consult a healthcare professional before taking any medication.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default RightPanel;
