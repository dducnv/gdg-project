import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, ArrowLeft, Sparkles, Key } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface HeaderProps {
  gameMode: 'bot' | 'local';
  hasGeminiKey: boolean;
  onOpenGeminiModal: () => void;
  onBackToLobby: () => void;
  onOpenRules: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameMode,
  hasGeminiKey,
  onOpenGeminiModal,
  onBackToLobby,
  onOpenRules
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="w-full border-b border-white/[0.08] bg-obsidian-900/80 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Brand & Mode */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToLobby}
          title="Trở về sảnh"
          className="p-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1.5 text-xs font-medium"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Sảnh</span>
        </button>

        <div className="flex items-baseline gap-2">
          <h1 className="font-display font-extrabold text-lg md:text-xl tracking-tight text-white flex items-center gap-2">
            <span>Ô ĂN QUAN</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 tracking-widest hidden md:inline-block">
              Cyber Folk
            </span>
          </h1>

          <span className="text-xs font-mono text-slate-400 hidden lg:inline">
            {gameMode === 'bot'
              ? (hasGeminiKey ? '• Đang đấu: Gemini Thần Sỏi AI' : '• Đang đấu: Bot AI Minimax')
              : '• Chế độ: 2 Người (Pass & Play)'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Gemini API Key Button */}
        <button
          onClick={onOpenGeminiModal}
          className={`p-2 md:px-3 md:py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-mono ${
            hasGeminiKey
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-glow-jade'
              : 'bg-obsidian-800 hover:bg-obsidian-700 border-white/[0.08] text-slate-400 hover:text-white'
          }`}
          title="Cài đặt Gemini API Key"
        >
          <Sparkles size={14} className={hasGeminiKey ? 'text-emerald-400' : 'text-slate-400'} />
          <span className="hidden sm:inline">
            {hasGeminiKey ? 'Gemini AI Active' : 'Gemini Key'}
          </span>
        </button>

        {/* Rules button */}
        <button
          onClick={onOpenRules}
          className="p-2 md:px-3 md:py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Xem luật chơi"
        >
          <HelpCircle size={16} />
          <span className="hidden sm:inline">Luật chơi</span>
        </button>

        {/* Audio Mute button */}
        <button
          onClick={handleToggleSound}
          className="p-2 md:px-3 md:py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1.5 text-xs font-medium"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-emerald-400" />}
          <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound On'}</span>
        </button>

        {/* GitHub Repository Link */}
        <a
          href="https://github.com/dducnv/gdg-project"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 md:px-3 md:py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="GitHub: dducnv/gdg-project"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </header>
  );
};
