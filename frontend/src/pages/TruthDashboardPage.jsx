import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Loader2, Cpu, Zap, MapPin } from 'lucide-react';
import LeftPanel from '../components/LeftPanel';
import RightPanel from '../components/RightPanel';
import { sendMessage, findDoctors } from '../services/api';
import ReactMarkdown from 'react-markdown';

const TruthDashboardPage = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(true);
    const [currentInput, setCurrentInput] = useState('');
    const [activeSources, setActiveSources] = useState([]);
    const [currentConfidence, setCurrentConfidence] = useState(0);
    const [currentRisk, setCurrentRisk] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [specialization, setSpecialization] = useState('');
    const [doctorLocation, setDoctorLocation] = useState('');
    const [medicines, setMedicines] = useState([]);
    const [locationInput, setLocationInput] = useState('');
    const [showLocationInput, setShowLocationInput] = useState(false);
    const [lastQuery, setLastQuery] = useState('');
    const [isDoctorSearching, setIsDoctorSearching] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('forensicHistory');
        if (savedHistory) setChatHistory(JSON.parse(savedHistory));
    }, []);

    useEffect(() => {
        if (chatHistory.length > 0) {
            localStorage.setItem('forensicHistory', JSON.stringify(chatHistory));
        }
    }, [chatHistory]);

    const calculateConfidence = (sources) => {
        if (!sources || sources.length === 0) return { conf: 0, risk: 'High' };
        // Use average similarity score if available
        const simScores = sources
            .map(s => s.similarity_score)
            .filter(s => s != null);

        let conf;
        if (simScores.length > 0) {
            const avgSim = simScores.reduce((a, b) => a + b, 0) / simScores.length;
            conf = Math.min(Math.round(avgSim * 100), 98);
        } else {
            conf = Math.min(Math.round(sources.length * 30 + Math.random() * 10), 98);
        }

        let risk = 'Low';
        if (conf < 50) risk = 'High';
        else if (conf < 80) risk = 'Medium';
        return { conf, risk };
    };

    const handleDoctorSearch = async (query) => {
        if (!locationInput.trim()) return;
        setIsDoctorSearching(true);
        try {
            const result = await findDoctors(query, locationInput);
            setDoctors(result.doctors || []);
            setSpecialization(result.specialization || '');
            setDoctorLocation(result.location || locationInput);
        } catch (error) {
            console.error('Doctor search failed:', error);
            setDoctors([]);
        } finally {
            setIsDoctorSearching(false);
            setShowLocationInput(false);
        }
    };

    const handleSend = async () => {
        if (!currentInput.trim()) return;
        const query = currentInput;
        setCurrentInput('');
        setLastQuery(query);

        const userMsg = { id: Date.now(), role: 'user', content: query };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await sendMessage(query);
            const { conf, risk } = calculateConfidence(response.sources);

            const aiMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: response.answer,
                sources: response.sources || [],
                confidence: conf,
                risk: risk,
                medicines: response.medicines || []
            };

            setMessages(prev => [...prev, aiMsg]);
            setActiveSources(response.sources || []);
            setCurrentConfidence(conf);
            setCurrentRisk(risk);
            setMedicines(response.medicines || []);
            setRightOpen(true);

            // Auto-set specialization from backend detection
            if (response.specialist_type) {
                setSpecialization(response.specialist_type);
                // Auto-trigger doctor search if user already provided a location
                if (locationInput.trim()) {
                    handleDoctorSearch(query);
                } else {
                    // Prompt user to enter location
                    setShowLocationInput(true);
                }
            }
        } catch (error) {
            const errorMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: "CRITICAL FAIL: Link to neural backend severed. Verify host connection.",
                sources: [],
                confidence: 0,
                risk: 'High'
            };
            setMessages(prev => [...prev, errorMsg]);
            setActiveSources([]);
            setCurrentConfidence(0);
            setCurrentRisk('High');
            setMedicines([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-forensic-black text-forensic-text overflow-hidden font-sans selection:bg-forensic-emerald/30">

            {/* LEFT PANEL */}
            <LeftPanel
                isOpen={leftOpen}
                onToggle={() => setLeftOpen(!leftOpen)}
                chatHistory={chatHistory}
                onSelectHistory={() => { }}
            />

            {/* CENTER WORKSPACE */}
            <div className="flex-1 flex flex-col relative bg-forensic-black grid-background">

                {/* Top Header */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-forensic-surface/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <Cpu className="w-5 h-5 text-forensic-emerald" />
                        <h1 className="font-mono font-bold tracking-widest text-sm flex items-center gap-2 uppercase">
                            Truth.Console
                            <span className="px-2 py-0.5 bg-forensic-emerald-dim text-forensic-emerald text-[10px] border border-forensic-emerald/50 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-forensic-emerald animate-pulse"></div>
                                ONLINE
                            </span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Find Specialist Button */}
                        <button
                            onClick={() => setShowLocationInput(!showLocationInput)}
                            className="terminal-text px-4 py-1.5 border border-white/10 hover:border-forensic-emerald hover:text-forensic-emerald transition-colors bg-forensic-black flex items-center gap-2"
                        >
                            <MapPin className="w-3 h-3" />
                            FIND_SPECIALIST
                        </button>
                        <button onClick={() => setRightOpen(!rightOpen)} className="terminal-text px-4 py-1.5 border border-white/10 hover:border-forensic-cyan hover:text-forensic-cyan transition-colors bg-forensic-black">
                            {rightOpen ? 'HIDE_TELEMETRY' : 'SHOW_TELEMETRY'}
                        </button>
                    </div>
                </header>

                {/* Location Input Bar */}
                <AnimatePresence>
                    {showLocationInput && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-b border-white/10"
                        >
                            <div className="p-3 bg-forensic-surface/60 flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-forensic-emerald flex-shrink-0" />
                                <input
                                    type="text"
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleDoctorSearch(lastQuery || 'general')}
                                    placeholder="Enter city name (e.g., Kolkata, Mumbai)..."
                                    className="flex-1 bg-transparent text-white placeholder-forensic-muted py-2 outline-none font-mono text-sm"
                                    spellCheck="false"
                                />
                                <button
                                    onClick={() => handleDoctorSearch(lastQuery || 'general')}
                                    disabled={isDoctorSearching || !locationInput.trim()}
                                    className="px-4 py-1.5 bg-forensic-emerald text-white text-xs font-bold font-mono tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:bg-forensic-surface disabled:text-forensic-muted uppercase"
                                >
                                    {isDoctorSearching ? 'SEARCHING...' : 'LOCATE'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Message Feed */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth z-10">
                    {messages.length === 0 && !isLoading && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                            <Terminal className="w-16 h-16 text-forensic-muted mb-4" strokeWidth={1} />
                            <h2 className="terminal-text text-lg">SYSTEM READY FOR QUERY</h2>
                            <p className="font-mono text-xs mt-2 max-w-md text-forensic-muted">Awaiting input stream. System will compile RAG vectors and execute forensic verification sequence.</p>
                        </div>
                    )}

                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] p-5 border ${msg.role === 'user' ? 'bg-forensic-surface border-forensic-violet border-r-4 neon-glow-violet' : 'bg-forensic-charcoal border-white/10 border-l-4 border-l-forensic-emerald'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                                            <Zap className="w-4 h-4 text-forensic-emerald" />
                                            <span className="terminal-text">OUTPUT_STREAM</span>
                                            {msg.confidence > 0 && (
                                                <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 border ${msg.confidence > 70 ? 'text-forensic-emerald border-forensic-emerald/30 bg-forensic-emerald-dim' :
                                                    msg.confidence > 40 ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' :
                                                        'text-forensic-crimson border-forensic-crimson/30 bg-forensic-crimson-dim'
                                                    }`}>
                                                    CONF: {msg.confidence}%
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {msg.role === 'user' && (
                                        <div className="flex items-center justify-end gap-2 mb-3 border-b border-white/10 pb-2">
                                            <span className="terminal-text text-forensic-violet">INPUT_TGT</span>
                                        </div>
                                    )}
                                    {msg.role === 'assistant' ? (
                                        <div className="leading-relaxed text-sm md:text-base font-sans prose prose-sm prose-invert max-w-none prose-headings:text-forensic-emerald prose-strong:text-white prose-p:text-forensic-text prose-li:text-forensic-text prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-a:text-forensic-cyan">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="leading-relaxed text-sm md:text-base font-mono text-forensic-violet text-right">{msg.content}</p>
                                    )}

                                    {/* Inline Medicine Suggestions */}
                                    {msg.role === 'assistant' && msg.medicines && msg.medicines.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm">💊</span>
                                                <span className="terminal-text text-forensic-violet text-[10px]">MEDICINE_REFS</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {msg.medicines.map((med, idx) => (
                                                    <span key={idx} className="text-xs px-2 py-1 bg-forensic-violet/10 border border-forensic-violet/30 text-forensic-violet font-mono">
                                                        {med.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-forensic-charcoal max-w-[80%] p-5 border border-white/10 border-l-4 border-l-forensic-cyan">
                                <div className="flex items-center gap-3 mb-4">
                                    <Loader2 className="w-4 h-4 text-forensic-cyan animate-spin" />
                                    <span className="terminal-text text-forensic-cyan">COMPUTING_VECTORS...</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 w-3/4 bg-forensic-surface animate-pulse"></div>
                                    <div className="h-2 w-full bg-forensic-surface animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="h-2 w-5/6 bg-forensic-surface animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-forensic-black border-t border-white/10 z-20">
                    <div className="max-w-4xl mx-auto flex items-center bg-forensic-surface border border-white/20 p-2 px-4 focus-within:border-forensic-violet focus-within:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
                        <span className="text-forensic-violet font-bold mr-3">&gt;</span>
                        <input
                            type="text"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Inject query..."
                            className="flex-1 bg-transparent text-white placeholder-forensic-muted py-3 outline-none font-mono text-sm"
                            spellCheck="false"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !currentInput.trim()}
                            className="ml-2 px-6 py-2 bg-forensic-violet text-white text-xs font-bold font-mono tracking-widest hover:bg-violet-600 transition-all disabled:opacity-50 disabled:bg-forensic-surface disabled:text-forensic-muted uppercase"
                        >
                            EXECUTE
                        </button>
                    </div>
                </div>

            </div>

            {/* RIGHT PANEL - Insights */}
            <RightPanel
                isOpen={rightOpen}
                activeSources={activeSources}
                confidence={currentConfidence}
                riskLevel={currentRisk}
                doctors={doctors}
                specialization={specialization}
                doctorLocation={doctorLocation}
                medicines={medicines}
            />
        </div>
    );
};

export default TruthDashboardPage;
