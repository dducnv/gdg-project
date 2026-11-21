import React, { useState } from 'react';
import { Key, Sparkles, X, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { getStoredGeminiKey, saveStoredGeminiKey } from '../services/geminiService';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved
}) => {
  const [keyInput, setKeyInput] = useState(getStoredGeminiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredGeminiKey(keyInput.trim());
    onKeySaved(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setKeyInput('');
    saveStoredGeminiKey('');
    onKeySaved('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-obsidian-900 border border-emerald-500/30 rounded-3xl shadow-glow-jade p-6 md:p-8">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg text-white">
                Cài Đặt Gemini API Key
              </h2>
              <p className="text-xs font-mono text-slate-400">Kích hoạt Gemini Thần Sỏi AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-obsidian-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-2 uppercase tracking-wider">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 rounded-2xl bg-obsidian-950 border border-white/[0.1] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white font-mono text-xs outline-none transition-all placeholder:text-slate-600 pr-10"
              />
              <Key size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline inline-flex items-center gap-1 text-[11px]"
            >
              <span>Lấy API key miễn phí tại Google AI Studio</span>
              <ExternalLink size={12} />
            </a>

            {keyInput && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-500 hover:text-red-400 text-[11px] transition-colors"
              >
                Xóa key
              </button>
            )}
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-obsidian-800/60 border border-white/[0.05] flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed font-mono">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>
              API Key chỉ lưu trực tiếp trong trình duyệt (LocalStorage) của bạn và gọi thẳng tới Google Gemini API. Không bao giờ gửi qua bất kỳ máy chủ trung gian nào.
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 font-display font-medium text-xs transition-colors"
            >
              Đóng
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-glow-jade flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check size={15} />
                  <span>Đã Lưu!</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Lưu & Kích Hoạt</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
