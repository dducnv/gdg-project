import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createInitialGameState, executeMove, GameState, MoveDirection, PlayerId } from '../src/game/rules.js';
import { MoveResult } from '../src/game/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3001;
const CLIENT_PORT = 5173;

interface PlayerClient {
  ws: WebSocket;
  playerId: PlayerId | 'spectator';
  name: string;
}

interface Room {
  code: string;
  host: WebSocket;
  p1: PlayerClient | null;
  p2: PlayerClient | null;
  spectators: PlayerClient[];
  state: GameState;
  createdAt: number;
}

const rooms = new Map<string, Room>();

// Helper to get local LAN IP
export function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIpAddress();

// Express app for serving static files if built
const app = express();
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    lanIp: localIp,
    activeRooms: rooms.size,
    timestamp: Date.now()
  });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function generateRoomCode(): string {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  if (rooms.has(code)) return generateRoomCode();
  return code;
}

function broadcastToRoom(room: Room, message: object, excludeWs?: WebSocket) {
  const payload = JSON.stringify(message);
  const recipients: WebSocket[] = [];
  if (room.p1 && room.p1.ws.readyState === WebSocket.OPEN && room.p1.ws !== excludeWs) {
    recipients.push(room.p1.ws);
  }
  if (room.p2 && room.p2.ws.readyState === WebSocket.OPEN && room.p2.ws !== excludeWs) {
    recipients.push(room.p2.ws);
  }
  for (const spec of room.spectators) {
    if (spec.ws.readyState === WebSocket.OPEN && spec.ws !== excludeWs) {
      recipients.push(spec.ws);
    }
  }

  for (const ws of recipients) {
    ws.send(payload);
  }
}

wss.on('connection', (ws: WebSocket) => {
  let currentRoomCode: string | null = null;
  let playerRole: PlayerId | 'spectator' | null = null;

  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'create_room': {
          const roomCode = generateRoomCode();
          const state = createInitialGameState();
          const playerClient: PlayerClient = {
            ws,
            playerId: 1,
            name: msg.name || 'Người chơi 1'
          };

          const room: Room = {
            code: roomCode,
            host: ws,
            p1: playerClient,
            p2: null,
            spectators: [],
            state,
            createdAt: Date.now()
          };

          rooms.set(roomCode, room);
          currentRoomCode = roomCode;
          playerRole = 1;

          const lanInviteUrl = `http://${localIp}:${CLIENT_PORT}/?room=${roomCode}`;

          ws.send(JSON.stringify({
            type: 'room_created',
            roomCode,
            playerId: 1,
            state,
            lanInviteUrl,
            lanIp: localIp
          }));
          break;
        }

        case 'join_room': {
          const roomCode = (msg.roomCode || '').trim();
          const room = rooms.get(roomCode);

          if (!room) {
            ws.send(JSON.stringify({
              type: 'error',
              message: `Không tìm thấy phòng #${roomCode}`
            }));
            return;
          }

          currentRoomCode = roomCode;

          if (!room.p2) {
            // Join as Player 2
            room.p2 = {
              ws,
              playerId: 2,
              name: msg.name || 'Người chơi 2'
            };
            playerRole = 2;

            ws.send(JSON.stringify({
              type: 'room_joined',
              roomCode,
              playerId: 2,
              opponentName: room.p1?.name || 'Người chơi 1',
              state: room.state
            }));

            // Notify P1 that P2 has joined
            if (room.p1 && room.p1.ws.readyState === WebSocket.OPEN) {
              room.p1.ws.send(JSON.stringify({
                type: 'opponent_joined',
                opponentName: room.p2.name,
                state: room.state
              }));
            }
          } else {
            // Room is full, join as Spectator
            const spectatorClient: PlayerClient = {
              ws,
              playerId: 'spectator',
              name: msg.name || `Khán giả ${room.spectators.length + 1}`
            };
            room.spectators.push(spectatorClient);
            playerRole = 'spectator';

            ws.send(JSON.stringify({
              type: 'room_joined',
              roomCode,
              playerId: 'spectator',
              p1Name: room.p1?.name,
              p2Name: room.p2?.name,
              state: room.state
            }));
          }
          break;
        }

        case 'make_move': {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          const { pitIndex, direction } = msg;

          if (playerRole !== room.state.currentTurn) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Chưa đến lượt của bạn'
            }));
            return;
          }

          try {
            const moveRes: MoveResult = executeMove(room.state, pitIndex, direction as MoveDirection);
            room.state = moveRes.finalState;

            // Broadcast move and steps to all players and spectators in room
            broadcastToRoom(room, {
              type: 'move_executed',
              pitIndex,
              direction,
              steps: moveRes.steps,
              finalState: room.state,
              logEntry: moveRes.logEntry
            });
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Nước đi không hợp lệ';
            ws.send(JSON.stringify({
              type: 'error',
              message: errorMsg
            }));
          }
          break;
        }

        case 'restart_game': {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          room.state = createInitialGameState();
          broadcastToRoom(room, {
            type: 'game_restarted',
            state: room.state
          });
          break;
        }

        case 'ping': {
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
        }
      }
    } catch (e) {
      console.error('Error handling WebSocket message:', e);
    }
  });

  ws.on('close', () => {
    if (currentRoomCode) {
      const room = rooms.get(currentRoomCode);
      if (room) {
        if (room.p1?.ws === ws) {
          room.p1 = null;
          broadcastToRoom(room, {
            type: 'opponent_left',
            message: 'Người chơi 1 đã rời khỏi phòng'
          });
        } else if (room.p2?.ws === ws) {
          room.p2 = null;
          broadcastToRoom(room, {
            type: 'opponent_left',
            message: 'Người chơi 2 đã rời khỏi phòng'
          });
        } else {
          room.spectators = room.spectators.filter(s => s.ws !== ws);
        }

        // Clean up empty rooms after 5 minutes
        if (!room.p1 && !room.p2 && room.spectators.length === 0) {
          rooms.delete(currentRoomCode);
        }
      }
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`  Ô Ăn Quan — Cyber Folk Local Hub is running!`);
  console.log(`  ----------------------------------------------------`);
  console.log(`  - Local:    http://localhost:${PORT}`);
  console.log(`  - LAN:      http://${localIp}:${PORT}`);
  console.log(`  - Client:   http://${localIp}:${CLIENT_PORT}`);
  console.log(`  - WebSockets listening on ws://${localIp}:${PORT}`);
  console.log(`======================================================\n`);
});
