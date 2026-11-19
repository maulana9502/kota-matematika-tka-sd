import 'dotenv/config';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const TEACHER_ADMIN_PASSWORD = process.env.TEACHER_ADMIN_PASSWORD || 'smpbhy07#123';

// Data persistence folder (safe local JSON backup alongside Firestore)
const DATA_DIR = path.resolve(process.cwd(), '.kota-data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
const ARCHIVE_FILE = path.join(DATA_DIR, 'archives.json');

try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
} catch {
  // Ignore if read-only fs
}

function loadJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as T;
    }
  } catch {
    // Ignore parse errors
  }
  return fallback;
}

function saveJsonFile(filePath: string, data: unknown) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Ignore write errors
  }
}

export interface ArchiveEntry {
  id: string;
  uid: string;
  studentName: string;
  school: string;
  className: string;
  chapterId: string;
  chapterTitle: string;
  questionLabel: string;
  pgScore: number;
  reflectionText: string;
  syncedToSheet: boolean;
  createdAt: string;
}

export interface ProgressRecord {
  uid: string;
  name: string;
  school: string;
  className: string;
  shirtColor: string;
  pantsColor: string;
  hairColor: string;
  hatStyle: string;
  companion: string;
  completedQuestions: number[];
  completedContoh: number[];
  completedSteps: number[];
  chapterMastery: Record<string, number>;
  bintangBersama: number;
  versusWins: number;
  level: number;
  updatedAt: string;
}

export interface OnlinePlayerState {
  id: string;
  name: string;
  school: string;
  className: string;
  shirtColor: string;
  pantsColor: string;
  hairColor: string;
  hatStyle: string;
  companion: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  moving: boolean;
  level: number;
  completedCount: number;
  insideBuildingId: string;
  isSpectator?: boolean;
  lastSeen: number;
}

interface DuelRoom {
  roomId: string;
  players: [string, string];
  questionIndices: number[];
  scores: Record<string, number>;
  progress: Record<string, number>;
  finished: Record<string, boolean>;
  createdAt: number;
}

const progressStore = new Map<string, ProgressRecord>(
  Object.entries(loadJsonFile<Record<string, ProgressRecord>>(PROGRESS_FILE, {}))
);
const archiveStore: ArchiveEntry[] = loadJsonFile<ArchiveEntry[]>(ARCHIVE_FILE, []);

const onlinePlayers = new Map<string, OnlinePlayerState>();
const wsClients = new Map<string, WebSocket>();
const duelRooms = new Map<string, DuelRoom>();

// Weather code mapping (Open-Meteo WMO codes -> Indonesian weather modes)
type WeatherCategory = 'Cerah' | 'Berawan' | 'Hujan' | 'Badai' | 'Terik';

function mapWmoToWeather(code: number, tempC: number): WeatherCategory {
  if (code >= 95) return 'Badai';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Hujan';
  if (code >= 1 && code <= 48) return 'Berawan';
  if (tempC >= 32) return 'Terik';
  return 'Cerah';
}

function getPrunedPlayers(): OnlinePlayerState[] {
  const now = Date.now();
  const active: OnlinePlayerState[] = [];
  for (const [id, p] of onlinePlayers.entries()) {
    if (now - p.lastSeen > 30000) {
      onlinePlayers.delete(id);
    } else {
      active.push(p);
    }
  }
  return active;
}

function broadcast(payload: unknown, excludeId?: string) {
  const msg = JSON.stringify(payload);
  for (const [id, client] of wsClients.entries()) {
    if (id !== excludeId && client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

function sendToPlayer(id: string, payload: unknown) {
  const client = wsClients.get(id);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(payload));
  }
}

function pickRandomQuestionIndices(count = 5, bankSize = 125): number[] {
  const indices = Array.from({ length: bankSize }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, count);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // 1. Live Local Weather Endpoint (Open-Meteo)
  app.get('/api/weather', async (req, res) => {
    const lat = Number(req.query.lat) || -7.536; // Default: Porong / Sidoarjo, East Java
    const lon = Number(req.query.lon) || 112.705;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,weather_code,is_day&timezone=auto`;
      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!resp.ok) throw new Error('Open-Meteo HTTP ' + resp.status);
      const json = (await resp.json()) as {
        current?: { temperature_2m?: number; weather_code?: number; is_day?: number };
      };
      const temp = typeof json.current?.temperature_2m === 'number' ? json.current.temperature_2m : 29;
      const code = typeof json.current?.weather_code === 'number' ? json.current.weather_code : 0;
      const category = mapWmoToWeather(code, temp);
      res.json({
        ok: true,
        weather: category,
        temperatureC: Math.round(temp),
        weatherCode: code,
        source: 'open-meteo'
      });
    } catch {
      res.json({
        ok: true,
        weather: 'Cerah' as WeatherCategory,
        temperatureC: 29,
        weatherCode: 0,
        source: 'fallback'
      });
    }
  });

  // 2. HTTP Multiplayer Heartbeat & Snapshot Fallback
  app.post('/api/multiplayer/heartbeat', (req, res) => {
    const body = req.body as Partial<OnlinePlayerState>;
    if (!body?.id || !body?.name) {
      res.status(400).json({ error: 'Missing player id or name' });
      return;
    }
    const existing = onlinePlayers.get(body.id);
    const updated: OnlinePlayerState = {
      id: String(body.id).slice(0, 80),
      name: String(body.name).slice(0, 80),
      school: String(body.school || 'SD/SMP').slice(0, 100),
      className: String(body.className || '6').slice(0, 30),
      shirtColor: String(body.shirtColor || '#2563eb'),
      pantsColor: String(body.pantsColor || '#1e293b'),
      hairColor: String(body.hairColor || '#1e1b18'),
      hatStyle: String(body.hatStyle || 'default'),
      companion: String(body.companion || 'garuda'),
      x: Number(body.x ?? existing?.x ?? 0),
      y: Number(body.y ?? existing?.y ?? 0),
      z: Number(body.z ?? existing?.z ?? 32),
      rotY: Number(body.rotY ?? existing?.rotY ?? 0),
      moving: Boolean(body.moving),
      level: Number(body.level ?? 1),
      completedCount: Number(body.completedCount ?? 0),
      insideBuildingId: String(body.insideBuildingId || ''),
      isSpectator: Boolean(body.isSpectator),
      lastSeen: Date.now()
    };
    onlinePlayers.set(updated.id, updated);
    res.json({ players: getPrunedPlayers() });
  });

  app.get('/api/multiplayer/players', (_req, res) => {
    res.json({ players: getPrunedPlayers() });
  });

  // 3. Progress Persistence API
  app.get('/api/progress', (req, res) => {
    const uid = String(req.query.uid || '');
    if (!uid) {
      res.status(400).json({ error: 'Missing uid' });
      return;
    }
    res.json({ progress: progressStore.get(uid) || null });
  });

  app.post('/api/progress', (req, res) => {
    const body = req.body as ProgressRecord;
    if (!body?.uid) {
      res.status(400).json({ error: 'Missing uid' });
      return;
    }
    const clean: ProgressRecord = {
      ...body,
      updatedAt: new Date().toISOString()
    };
    progressStore.set(clean.uid, clean);
    saveJsonFile(PROGRESS_FILE, Object.fromEntries(progressStore.entries()));
    res.json({ ok: true, progress: clean });
  });

  // 4. Teacher Archive (Sheet Guru) API (NO Photo Upload)
  app.get('/api/archive', (_req, res) => {
    res.json({ entries: archiveStore.slice().reverse() });
  });

  app.post('/api/archive', (req, res) => {
    const body = req.body as Partial<ArchiveEntry>;
    if (!body?.studentName || !body?.chapterId) {
      res.status(400).json({ error: 'Missing required archive fields' });
      return;
    }
    const entry: ArchiveEntry = {
      id: body.id || `arc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      uid: String(body.uid || 'guest').slice(0, 128),
      studentName: String(body.studentName).slice(0, 100),
      school: String(body.school || 'Sekolah').slice(0, 120),
      className: String(body.className || '6').slice(0, 40),
      chapterId: String(body.chapterId).slice(0, 40),
      chapterTitle: String(body.chapterTitle || body.chapterId).slice(0, 120),
      questionLabel: String(body.questionLabel || 'Latihan Bab').slice(0, 120),
      pgScore: Number(body.pgScore ?? 0),
      reflectionText: String(body.reflectionText || '').slice(0, 2000),
      syncedToSheet: Boolean(body.syncedToSheet),
      createdAt: body.createdAt || new Date().toISOString()
    };
    archiveStore.push(entry);
    if (archiveStore.length > 1000) archiveStore.shift();
    saveJsonFile(ARCHIVE_FILE, archiveStore);
    res.json({ ok: true, entry });
  });

  // 5. Teacher Admin Auth & Class Overview API
  app.post('/api/admin/verify', (req, res) => {
    const pass = String((req.body as { password?: string })?.password || '');
    if (pass === TEACHER_ADMIN_PASSWORD) {
      res.json({ ok: true });
      return;
    }
    res.status(401).json({ ok: false, message: 'Sandi Admin Guru tidak cocok.' });
  });

  app.get('/api/admin/overview', (req, res) => {
    const pass = String(req.headers['x-admin-pass'] || '');
    if (pass !== TEACHER_ADMIN_PASSWORD) {
      res.status(403).json({ error: 'Akses Admin Guru ditolak' });
      return;
    }
    res.json({
      players: getPrunedPlayers(),
      progressList: Array.from(progressStore.values()),
      archiveCount: archiveStore.length
    });
  });

  // Mount Vite Dev Middleware OR Static Dist
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = http.createServer(app);

  // WebSocket Server at /ws for live 3D multiplayer & 1v1 Versus Duel
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    let playerId = '';

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(String(raw)) as { type: string; [key: string]: unknown };

        if (data.type === 'join') {
          const p = data.player as Partial<OnlinePlayerState>;
          if (!p?.id || !p?.name) return;
          playerId = String(p.id);
          wsClients.set(playerId, ws);

          const fullPlayer: OnlinePlayerState = {
            id: playerId,
            name: String(p.name).slice(0, 80),
            school: String(p.school || 'Sekolah').slice(0, 100),
            className: String(p.className || '6').slice(0, 30),
            shirtColor: String(p.shirtColor || '#2563eb'),
            pantsColor: String(p.pantsColor || '#1e293b'),
            hairColor: String(p.hairColor || '#1e1b18'),
            hatStyle: String(p.hatStyle || 'default'),
            companion: String(p.companion || 'garuda'),
            x: Number(p.x ?? 0),
            y: Number(p.y ?? 0),
            z: Number(p.z ?? 32),
            rotY: Number(p.rotY ?? 0),
            moving: false,
            level: Number(p.level ?? 1),
            completedCount: Number(p.completedCount ?? 0),
            insideBuildingId: String(p.insideBuildingId || ''),
            isSpectator: Boolean(p.isSpectator),
            lastSeen: Date.now()
          };
          onlinePlayers.set(playerId, fullPlayer);

          ws.send(
            JSON.stringify({
              type: 'players_snapshot',
              players: getPrunedPlayers().filter((pl) => pl.id !== playerId)
            })
          );
          broadcast({ type: 'player_joined', player: fullPlayer }, playerId);
        } else if (data.type === 'move' && playerId) {
          const existing = onlinePlayers.get(playerId);
          if (!existing) return;
          existing.x = Number(data.x ?? existing.x);
          existing.y = Number(data.y ?? existing.y);
          existing.z = Number(data.z ?? existing.z);
          existing.rotY = Number(data.rotY ?? existing.rotY);
          existing.moving = Boolean(data.moving);
          existing.insideBuildingId = String(data.insideBuildingId ?? '');
          existing.lastSeen = Date.now();
          broadcast(
            {
              type: 'player_moved',
              id: playerId,
              x: existing.x,
              y: existing.y,
              z: existing.z,
              rotY: existing.rotY,
              moving: existing.moving,
              insideBuildingId: existing.insideBuildingId
            },
            playerId
          );
        } else if (data.type === 'profile_update' && playerId) {
          const existing = onlinePlayers.get(playerId);
          if (!existing) return;
          const p = data.player as Partial<OnlinePlayerState>;
          if (p.shirtColor) existing.shirtColor = String(p.shirtColor);
          if (p.pantsColor) existing.pantsColor = String(p.pantsColor);
          if (p.hairColor) existing.hairColor = String(p.hairColor);
          if (p.hatStyle) existing.hatStyle = String(p.hatStyle);
          if (p.companion) existing.companion = String(p.companion);
          if (typeof p.level === 'number') existing.level = p.level;
          if (typeof p.completedCount === 'number') existing.completedCount = p.completedCount;
          if (typeof p.isSpectator === 'boolean') existing.isSpectator = p.isSpectator;
          existing.lastSeen = Date.now();
          broadcast({ type: 'player_updated', player: existing }, playerId);
        } else if (data.type === 'versus_challenge' && playerId) {
          const targetId = String(data.targetId || '');
          const challenger = onlinePlayers.get(playerId);
          if (!targetId || !challenger) return;
          sendToPlayer(targetId, {
            type: 'versus_invite',
            challengerId: playerId,
            challengerName: challenger.name,
            challengerClass: challenger.className,
            challengerSchool: challenger.school
          });
        } else if (data.type === 'versus_response' && playerId) {
          const challengerId = String(data.challengerId || '');
          const accepted = Boolean(data.accepted);
          if (!challengerId) return;
          const acceptor = onlinePlayers.get(playerId);
          const challenger = onlinePlayers.get(challengerId);
          if (!accepted) {
            sendToPlayer(challengerId, {
              type: 'versus_declined',
              byName: acceptor?.name || 'Teman'
            });
            return;
          }
          if (!acceptor || !challenger) return;
          const roomId = `duel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const questionIndices = pickRandomQuestionIndices(5, 125);
          const room: DuelRoom = {
            roomId,
            players: [challengerId, playerId],
            questionIndices,
            scores: { [challengerId]: 0, [playerId]: 0 },
            progress: { [challengerId]: 0, [playerId]: 0 },
            finished: { [challengerId]: false, [playerId]: false },
            createdAt: Date.now()
          };
          duelRooms.set(roomId, room);
          sendToPlayer(challengerId, {
            type: 'versus_start',
            roomId,
            questionIndices,
            opponent: { id: acceptor.id, name: acceptor.name, className: acceptor.className, school: acceptor.school }
          });
          sendToPlayer(playerId, {
            type: 'versus_start',
            roomId,
            questionIndices,
            opponent: { id: challenger.id, name: challenger.name, className: challenger.className, school: challenger.school }
          });
        } else if (data.type === 'versus_answer' && playerId) {
          const roomId = String(data.roomId || '');
          const room = duelRooms.get(roomId);
          if (!room) return;
          const points = Number(data.points ?? 0);
          const round = Number(data.round ?? 0);
          room.scores[playerId] = (room.scores[playerId] || 0) + points;
          room.progress[playerId] = round + 1;
          if (round + 1 >= room.questionIndices.length) {
            room.finished[playerId] = true;
          }
          const opponentId = room.players.find((id) => id !== playerId);
          if (opponentId) {
            sendToPlayer(opponentId, {
              type: 'versus_opponent_update',
              roomId,
              opponentScore: room.scores[playerId],
              opponentProgress: room.progress[playerId],
              opponentFinished: room.finished[playerId]
            });
          }
          if (room.players.every((id) => room.finished[id])) {
            const [p1, p2] = room.players;
            const s1 = room.scores[p1] || 0;
            const s2 = room.scores[p2] || 0;
            const winnerId = s1 === s2 ? 'draw' : s1 > s2 ? p1 : p2;
            for (const pid of room.players) {
              sendToPlayer(pid, {
                type: 'versus_finished',
                roomId,
                scores: room.scores,
                winnerId
              });
            }
            duelRooms.delete(roomId);
          }
        } else if (data.type === 'admin_broadcast' && playerId) {
          if (String(data.adminPass || '') !== TEACHER_ADMIN_PASSWORD) return;
          broadcast(
            {
              type: 'admin_event',
              action: String(data.action || ''),
              frozen: Boolean(data.frozen),
              message: String(data.message || ''),
              speak: Boolean(data.speak),
              timeMode: data.timeMode ? String(data.timeMode) : undefined,
              weatherMode: data.weatherMode ? String(data.weatherMode) : undefined
            },
            playerId
          );
        } else if (data.type === 'ping') {
          if (playerId) {
            const p = onlinePlayers.get(playerId);
            if (p) p.lastSeen = Date.now();
          }
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch {
        // Ignore malformed ws messages
      }
    });

    ws.on('close', () => {
      if (playerId) {
        wsClients.delete(playerId);
        onlinePlayers.delete(playerId);
        broadcast({ type: 'player_left', id: playerId }, playerId);
      }
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Kota Matematika 3D Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
