import { GameState, MoveDirection, PlayerId } from '../game/types';
import { getValidMoves, executeMove } from '../game/rules';
import { getBotMove } from '../game/botAI';

const GEMINI_STORAGE_KEY = 'o_an_quan_gemini_api_key';

export function getStoredGeminiKey(): string {
  try {
    return localStorage.getItem(GEMINI_STORAGE_KEY) || import.meta.env.GEMINI_API_KEY || '';
  } catch {
    return import.meta.env.GEMINI_API_KEY || '';
  }
}

export function saveStoredGeminiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(GEMINI_STORAGE_KEY);
    }
  } catch { }
}

export interface GeminiMoveResult {
  pitIndex: number;
  direction: MoveDirection;
  commentary: string;
}

/**
 * Request Gemini to analyze the board and pick the optimal tactical move with commentary.
 */
export async function getGeminiMove(
  state: GameState,
  botPlayer: PlayerId = 2,
  apiKey: string = getStoredGeminiKey()
): Promise<GeminiMoveResult> {
  const validMoves = getValidMoves(state, botPlayer);
  if (validMoves.length === 0) {
    throw new Error('Không có nước đi hợp lệ');
  }

  // Fallback function using local Minimax
  const fallback = (): GeminiMoveResult => {
    const localMove = getBotMove(state, botPlayer, 'strategic');
    const pick = localMove || {
      pitIndex: validMoves[0].pitIndex,
      direction: validMoves[0].directions[0],
      expectedScoreGain: 0
    };
    return {
      pitIndex: pick.pitIndex,
      direction: pick.direction,
      commentary: 'Tính toán theo thuật toán Minimax nội bộ.'
    };
  };

  if (!apiKey || !apiKey.trim()) {
    return fallback();
  }

  // Prepare concise board summary for Gemini
  const boardSummary = state.board.map(p => ({
    pit: p.index,
    type: p.isQuan ? 'Quan' : 'Dân',
    stones: p.smallStones,
    quanPiece: p.hasBigQuan,
    owner: p.owner
  }));

  const candidateList = validMoves.flatMap(m =>
    m.directions.map(d => ({ pitIndex: m.pitIndex, direction: d }))
  );

  const prompt = `Bạn là "Thần Sỏi AI" - bậc thầy cờ dân gian Ô Ăn Quan trong phiên bản Cyber Folk của GDG.
Đến lượt bạn (Player ${botPlayer}).
Điểm số hiện tại: P1=${state.scores[1]}, P2=${state.scores[2]}.
Trạng thái bàn cờ (12 ô: 0=Quan trái, 1-5=Dân P1, 6=Quan phải, 7-11=Dân P2):
${JSON.stringify(boardSummary)}

Danh sách nước đi hợp lệ:
${JSON.stringify(candidateList)}

Luật quan trọng:
- Bốc hết sỏi ở ô đã chọn, rải từng viên theo hướng (clockwise=cùng chiều KĐH, counterclockwise=ngược chiều KĐH).
- Ô tiếp theo là ô trống và ô kế tiếp có sỏi -> Ăn toàn bộ sỏi ô kế tiếp.
- Gặp 2 ô trống hoặc rơi trước Quan -> dừng.
- Mục tiêu: Tối đa hóa số sỏi ăn được hoặc giăng bẫy đối thủ.

Hãy chọn 1 nước đi tốt nhất từ danh sách trên và đưa ra lời bình luận (commentary) phong cách Cyber Folk dí dỏm, kiêu hãnh, đậm chất cờ Việt (tối đa 15 từ tiếng Việt).

Trả về kết quả ĐÚNG định dạng JSON sau:
{
  "pitIndex": number,
  "direction": "clockwise" | "counterclockwise",
  "commentary": "string"
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      console.warn('Gemini API returned error status:', response.status);
      return fallback();
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return fallback();

    const parsed = JSON.parse(candidateText);

    // Validate chosen move is actually in candidates
    const isValid = candidateList.some(
      c => c.pitIndex === parsed.pitIndex && c.direction === parsed.direction
    );

    if (isValid) {
      return {
        pitIndex: parsed.pitIndex,
        direction: parsed.direction,
        commentary: parsed.commentary || 'Nước đi chiến thuật từ Gemini AI!'
      };
    }

    return fallback();
  } catch (err) {
    console.warn('Gemini API call failed, falling back to Minimax:', err);
    return fallback();
  }
}
