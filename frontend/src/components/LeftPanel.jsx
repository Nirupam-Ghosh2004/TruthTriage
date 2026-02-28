import React from 'react';
import { Settings, History, AlertTriangle, Bookmark, ChevronLeft, ChevronRight, Terminal } from 'lucide-react';

const LeftPanel = ({ isOpen, onToggle, chatHistory, onSelectHistory }) => {
    return (
        <div className={`relative transition-all duration-300 ease-in-out border-r border-white/10 tech-panel max-h-[90vh] overflow-y-auto ${isOpen ? 'w-64' : 'w-16'}`}>
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-forensic-black/50">
                {isOpen && <h2 className="terminal-text flex items-center gap-2"><Terminal className="w-4 h-4" /> SYS_DIR</h2>}
                <button onClick={onToggle} className="p-1 hover:bg-white/10 text-forensic-muted hover:text-white transition-colors">
                    {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
            </div>

            <div className="p-3 space-y-8">
                <div>
                    {isOpen && <p className="terminal-text text-[10px] mb-3 opacity-70">[/var/log/history]</p>}
                    <ul className="space-y-2">
                        {chatHistory.slice(0, 5).map((chat, idx) => (
                            <li key={idx}>
                                <button
                                    onClick={() => onSelectHistory(chat.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-forensic-muted hover:text-white hover:border-forensic-emerald border border-transparent transition-colors text-left bg-forensic-surface/30"
                                >
                                    <History className="w-4 h-4 shrink-0 text-forensic-emerald" />
                                    {isOpen && <span className="truncate">{chat.title || "Verification_Run"}</span>}
                                </button>
                            </li>
                        ))}
                        {chatHistory.length === 0 && isOpen && (
                            <li className="px-2 py-2 text-xs text-forensic-muted font-mono bg-forensic-surface/30 border border-white/5">EMPTY_LOG</li>
                        )}
                    </ul>
                </div>

                <div>
                    {isOpen && <p className="terminal-text text-[10px] mb-3 opacity-70">[/mnt/saved_data]</p>}
                    <ul>
                        <li>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-forensic-muted hover:text-white hover:border-forensic-emerald border border-transparent transition-colors text-left bg-forensic-surface/30">
                                <Bookmark className="w-4 h-4 shrink-0 text-forensic-violet" />
                                {isOpen && <span>Medical_Journals</span>}
                            </button>
                        </li>
                    </ul>
                </div>

                <div>
                    {isOpen && <p className="terminal-text text-[10px] mb-3 opacity-70">[/sys/alerts]</p>}
                    <ul>
                        <li>
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-forensic-crimson hover:text-red-300 hover:border-forensic-crimson transition-colors text-left bg-forensic-crimson-dim border border-forensic-crimson/30">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                {isOpen && <span className="text-xs font-bold tracking-widest uppercase">2 High Risk_</span>}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="absolute bottom-0 w-full p-3 border-t border-white/10 bg-forensic-black">
                <button className="w-full flex items-center gap-3 px-3 py-3 text-sm text-forensic-muted hover:text-white border border-transparent hover:border-forensic-cyan transition-colors text-left bg-forensic-surface/50">
                    <Settings className="w-4 h-4 shrink-0 text-forensic-cyan" />
                    {isOpen && <span>SYS_CONFIG</span>}
                </button>
            </div>
        </div>
    );
};

export default LeftPanel;
