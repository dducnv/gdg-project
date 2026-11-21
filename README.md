# Ô Ăn Quan — Cyber Folk Edition (Local WebSocket)

Bản tái hiện kỹ thuật số của trò chơi dân gian kinh điển Việt Nam theo phong cách **Neo-Heritage / Obsidian Craft**, chạy hoàn toàn trên môi trường **Local (100% Offline / LAN)**, hỗ trợ 2 người chơi thi đấu thời gian thực qua **WebSocket** và chế độ đấu Bot AI thuật toán Minimax.

---

## ⚡ Khởi Động Nhanh (1 Câu Lệnh)

Chỉ cần chạy lệnh sau để khởi động đồng thời cả Client và Local WebSocket Hub:

```bash
npm run dev
```

- **Màn hình giao diện (Client):** `http://localhost:5173`
- **Mã chia sẻ mạng nội bộ (LAN):** Hệ thống tự động phát hiện IP LAN (ví dụ: `http://192.168.1.x:5173/?room=8080`) để đồng nghiệp/bạn bè cùng kết nối vào chơi ngay từ điện thoại hoặc laptop khác trong cùng mạng Wi-Fi.

### Các lệnh khác:
- `npm test`: Chạy bộ unit tests kiểm tra toàn bộ luật rải quân, nối nước, ăn liên hoàn và vét sỏi.
- `npm run build`: Build gói tĩnh tối ưu hóa.
- `npm start`: Chạy production server nội bộ.

---

## 🎮 Các Chế Độ Chơi

1. **Thần Sỏi AI (Bot Solo):**
   - Đấu tập 1-vs-1 với thuật toán Minimax Alpha-Beta.
   - 2 cấp độ: **Tập sự (Easy)** và **Cao thủ chiến thuật (Strategic Master)** tính toán sâu các thế giăng bẫy ăn liên hoàn.
2. **Phòng Thi Đấu LAN (Local WebSocket):**
   - Tạo phòng (Host) sinh mã 4 số ngẫu nhiên kèm link chia sẻ LAN một chạm.
   - Tham gia phòng (Join) bằng mã số.
   - Đồng bộ trạng thái thời gian thực với độ trễ `< 5ms`.
3. **Cùng Máy (Pass & Play):**
   - 2 người ngồi đối diện nhau thi đấu trên 1 màn hình máy tính hoặc tablet, hoàn toàn không cần kết nối mạng.

---

## 💎 Điểm Nhấn Thiết Kế & Kỹ Thuật

- **Phong cách Neo-Heritage / Obsidian Craft:**
  - Nền Obsidian Dark (`#070A0E`, `#0B0F14`) kết hợp bề mặt kính mờ Slate Glass và viền hairline tinh xảo.
  - Điểm nhấn Ngọc Bích (`#10B981`) cho Người chơi 1 và Hổ Phách Ấm (`#F59E0B`) cho Người chơi 2 / Bot.
  - Phông chữ kết hợp: **Space Grotesk** (Display), **JetBrains Mono** (Số liệu đếm sỏi), **Inter** (Nội dung).
- **Âm Thanh Thủ Trợ (Web Audio API Synthesizer):**
  - Không cần tải file âm thanh nặng ngoài mạng: toàn bộ tiếng sỏi rơi lách cách (*"clack-click"*), tiếng thu hoạch điểm mộc cầm (*marimba/woodblock*), tiếng chững trước Quan và âm thanh chiến thắng đều được tổng hợp trực tiếp bằng mã nguồn Web Audio.
- **Diễn Hoạt Từng Viên Sỏi:**
  - Tái hiện trực quan quá trình bốc sỏi trên tay, rải từng ô với độ trễ 180ms, nối nước khi ô sau có sỏi và kích hoạt ăn quân liên hoàn.

---

## 📜 Cấu Trúc Mã Nguồn

```
├── src/
│   ├── game/
│   │   ├── types.ts         # Khai báo kiểu dữ liệu trạng thái bàn cờ, nước đi, animation step
│   │   ├── rules.ts         # Rules engine Ô Ăn Quan thuần túy, không phụ thuộc UI
│   │   └── botAI.ts         # Thuật toán Heuristic Minimax & Alpha-Beta Pruning
│   ├── audio/
│   │   └── soundEngine.ts   # Bộ tổng hợp âm thanh thủ tục (Web Audio Synthesizer)
│   ├── components/
│   │   ├── Board.tsx        # Bàn cờ Obsidian Slate với 2 ô Quan & 10 ô Dân
│   │   ├── PebbleVisual.tsx # Phân bố sỏi tự nhiên & hiển thị ngọc Quan
│   │   ├── ScoreBoard.tsx   # Bảng điểm điện tử & đèn báo lượt
│   │   ├── Lobby.tsx        # Sảnh chờ tạo phòng LAN, chọn Bot, pass & play
│   │   ├── GameLogs.tsx     # Tường thuật ván đấu dạng radar chiến thuật
│   │   ├── RulesModal.tsx   # Modal hướng dẫn luật chơi chi tiết
│   │   └── GameOverModal.tsx# Thông báo thắng cuộc & hiệu ứng pháo hoa
│   ├── App.tsx              # Component điều phối chính
│   └── main.tsx             # Entrypoint React
├── server/
│   └── index.ts             # Local WebSocket Hub (ws + express) & LAN IP discovery
├── tests/
│   └── rules.test.ts        # Unit test Vitest kiểm thử luật chơi
└── package.json
```
