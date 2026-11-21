import React from 'react';
import { X, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-obsidian-900 border border-white/10 rounded-3xl shadow-elevated-card p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg md:text-xl text-white">
                Luật Chơi Ô Ăn Quan
              </h2>
              <p className="text-xs font-mono text-slate-400">Cyber Folk Edition Reference</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-obsidian-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-xs md:text-sm text-slate-300 leading-relaxed font-body">
          <div className="p-4 rounded-2xl bg-obsidian-800/60 border border-white/[0.05]">
            <h3 className="font-display font-bold text-emerald-400 text-sm mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 size={16} /> 1. Bàn Cờ & Phân Bố Sỏi Ban Đầu
            </h3>
            <p>
              Bàn cờ gồm <strong>10 ô dân</strong> (2 hàng, mỗi bên 5 ô, mỗi ô có 5 sỏi nhỏ) và <strong>2 ô quan</strong> hình bán nguyệt ở 2 đầu (mỗi ô quan có 1 viên Quan lớn trị giá 10 điểm). Tổng điểm khởi đầu là <strong>70 điểm</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-obsidian-800/60 border border-white/[0.05]">
            <h3 className="font-display font-bold text-emerald-400 text-sm mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 size={16} /> 2. Cách Đi & Rải Sỏi
            </h3>
            <p>
              Người chơi đến lượt chọn 1 ô dân có sỏi thuộc hàng của mình, chọn hướng rải: <strong>Cùng chiều kim đồng hồ (→)</strong> hoặc <strong>Ngược chiều kim đồng hồ (←)</strong>. Hệ thống bốc toàn bộ sỏi và rải đều mỗi ô 1 viên lần lượt.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-obsidian-800/60 border border-white/[0.05]">
            <h3 className="font-display font-bold text-amber-400 text-sm mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 size={16} /> 3. Nối Nước & Ăn Quân
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>
                <strong>Nối nước:</strong> Nếu sỏi cuối rơi vào ô mà ô tiếp theo là ô dân có sỏi, tự động bốc tiếp để rải tiếp.
              </li>
              <li>
                <strong>Ăn quân:</strong> Nếu ô tiếp theo là ô trống, và ô kế sau ô trống đó có sỏi/quan ➔ Bạn được <strong>ĂN</strong> toàn bộ sỏi tại ô đó!
              </li>
              <li>
                <strong>Ăn liên hoàn:</strong> Nếu sau ô vừa ăn lại là ô trống rồi đến ô có sỏi, bạn tiếp tục được ăn chuỗi ô đó.
              </li>
              <li>
                <strong>Chững lại:</strong> Sỏi cuối rơi vào ô trước ô Quan, hoặc gặp 2 ô trống liên tiếp ➔ Kết thúc lượt.
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-obsidian-800/60 border border-white/[0.05]">
            <h3 className="font-display font-bold text-emerald-400 text-sm mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 size={16} /> 4. Vét Sỏi & Kết Thúc Ván
            </h3>
            <p>
              Nếu đến lượt mà cả 5 ô dân của bạn đều trống, bạn lấy 5 điểm từ quỹ của mình rải đều vào 5 ô dân để đi tiếp. Ván đấu kết thúc khi <strong>cả 2 ô quan đều đã bị ăn sạch</strong>. Ai có tổng điểm lớn hơn sẽ giành chiến thắng!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-display font-bold text-xs tracking-wider uppercase transition-all shadow-glow-jade"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
