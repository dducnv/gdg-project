# Ô Ăn Quan — Cyber Folk Edition

[![GitHub Repository](https://img.shields.io/badge/GitHub-dducnv%2Fgdg--project-181717?style=flat&logo=github)](https://github.com/dducnv/gdg-project)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

Bản tái hiện kỹ thuật số của trò chơi dân gian kinh điển Việt Nam theo phong cách **Neo-Heritage / Obsidian Craft**, hoạt động **100% trong trình duyệt (Client-Side / Static)**, sẵn sàng deploy ngay lên **Vercel, Netlify, GitHub Pages** chỉ bằng 1 bước mà không cần bất kỳ server backend nào.

- **GitHub Repository:** [https://github.com/dducnv/gdg-project](https://github.com/dducnv/gdg-project)

---

## ⚡ Khởi Động & Deploy

### Chạy Local:
```bash
git clone https://github.com/dducnv/gdg-project.git
cd gdg-project
npm install
npm run dev:client
```
Truy cập: `http://localhost:5173`

### Deploy lên Vercel:
Chỉ cần liên kết Git với Vercel hoặc chạy:
```bash
npx vercel
```
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

---

## 🎮 Các Chế Độ Chơi

1. **Đấu Thần Sỏi AI (Bot Minimax):**
   - Đấu 1-vs-1 với thuật toán Minimax Alpha-Beta chạy trực tiếp trên trình duyệt.
   - 2 cấp độ: **Tập sự (Easy)** và **Cao thủ (Strategic Master)** biết gài bẫy ăn liên hoàn và bảo toàn sỏi.
2. **Chơi Cùng Máy (2 Người Pass & Play):**
   - 2 người ngồi đối diện nhau cùng thi đấu trên 1 laptop, iPad hoặc máy tính bảng theo lượt.

---

## 💎 Điểm Nhấn Kỹ Thuật

- **Âm thanh thủ tục Web Audio API:** Tiếng sỏi *"clack-click"* gõ vào nhau, tiếng mộc cầm marimba khi ăn điểm được tổng hợp trực tiếp bằng mã nguồn, không tốn băng thông tải file âm thanh.
- **Phong cách Neo-Heritage / Obsidian Craft:** Bàn cờ Slate Glass trên nền tối sâu Obsidian, hiệu ứng điểm ngọc Jade & Amber, phông chữ Space Grotesk & JetBrains Mono.
- **Diễn hoạt mượt mà:** Trực quan từng bước rải sỏi (180ms/viên), nối nước và ăn liên hoàn.
- **100% Client-Side:** Không cần backend, không lo độ trễ mạng hay chi phí duy trì server.
