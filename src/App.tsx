import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CITY_BUILDINGS } from './data/buildings';
import { TKA_QUESTIONS } from './data/tkaData';
import { Kota3DEngine } from './game/Kota3DEngine';
import {
  AvatarAppearance,
  BuildingDef,
  BuildingId,
  ChapterId,
  CompanionId,
  OnlinePlayer,
  PlayerIdentity,
  PlayerProgress,
  ResolvedTimeOfDay,
  StationId,
  TimeOfDayMode,
  UserRole,
  WeatherType
} from './types/game';
import {
  auth,
  loadCloudProgress,
  removeOnlinePlayerFirestore,
  saveCloudArchive,
  saveCloudProgress,
  signInWithGoogleBasic,
  signOutGoogle,
  subscribeOnlinePlayersFirestore,
  testFirestoreConnection,
  upsertOnlinePlayerFirestore
} from './utils/firebaseClient';
import { DEFAULT_TEACHER_EMAIL } from './utils/googleSheets';
import { sound, voice } from './utils/sound';
import { LoginScreen } from './components/game/LoginScreen';
import { TouchJoystick } from './components/game/TouchJoystick';
import { MinimapRadar } from './components/game/MinimapRadar';
import { AvatarStudioModal } from './components/game/AvatarStudioModal';
import { OnlinePlayersModal } from './components/game/OnlinePlayersModal';
import { BuildingStationModal } from './components/game/BuildingStationModal';
import { ActiveDuelState, VersusModal } from './components/game/VersusModal';
import { SheetGuruModal } from './components/game/SheetGuruModal';
import { AdminGuruModal } from './components/game/AdminGuruModal';
import { TeacherPanel } from './components/TeacherPanel';
import {
  ArrowUp,
  Cloud,
  CloudLightning,
  CloudRain,
  DoorOpen,
  Eye,
  FileSpreadsheet,
  Gamepad2,
  LogOut,
  Maximize2,
  Minimize2,
  Moon,
  Music,
  Palette,
  RefreshCw,
  Shield,
  Sun,
  Sunrise,
  Sunset,
  Swords,
  Users,
  Volume2,
  VolumeX
} from 'lucide-react';

const DEFAULT_IDENTITY: PlayerIdentity = {
  uid: `guest_${Math.random().toString(36).slice(2, 10)}`,
  name: '',
  school: 'SMP Kemala Bhayangkari 7 Porong',
  className: '6A',
  shirtColor: '#2563EB',
  pantsColor: '#1E293B',
  hairColor: '#1E1B18',
  hatStyle: 'default',
  companion: 'garuda',
  isGoogleUser: false
};

const DEFAULT_PROGRESS: PlayerProgress = {
  completedQuestions: [],
  completedContoh: [],
  completedSteps: [],
  chapterMastery: {
    bilangan: 0,
    geometri: 0,
    pengukuran: 0,
    data: 0,
    strategi: 0
  },
  bintangBersama: 0,
  versusWins: 0,
  level: 1
};

function makeDeterministicStudentUid(name: string, school: string, className: string): string {
  const raw = `${name.trim().toLowerCase()}|${school.trim().toLowerCase()}|${className.trim().toLowerCase()}`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `stu_${(hash >>> 0).toString(36)}`;
}

function loadLocalIdentity(): PlayerIdentity {
  try {
    const raw = localStorage.getItem('kota3d_identity');
    if (raw) {
      return { ...DEFAULT_IDENTITY, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_IDENTITY;
}

function loadLocalProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem('kota3d_progress');
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
      return {
        ...DEFAULT_PROGRESS,
        ...parsed,
        chapterMastery: {
          ...DEFAULT_PROGRESS.chapterMastery,
          ...(parsed.chapterMastery || {})
        }
      };
    }
    const oldStickers = localStorage.getItem('kota_mat_stickers');
    const oldBintang = localStorage.getItem('kota_mat_bintang');
    if (oldStickers || oldBintang) {
      const cq = oldStickers ? (JSON.parse(oldStickers) as number[]) : [];
      const bb = Number(oldBintang || '0');
      return {
        ...DEFAULT_PROGRESS,
        completedQuestions: cq,
        bintangBersama: bb,
        level: Math.max(1, 1 + Math.floor(cq.length / 4))
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_PROGRESS;
}

function getTabSessionId(): string {
  try {
    let tabId = sessionStorage.getItem('kota3d_tab_id');
    if (!tabId) {
      tabId = Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem('kota3d_tab_id', tabId);
    }
    return tabId;
  } catch {
    return Math.random().toString(36).slice(2, 8);
  }
}

function resolveAutoTime(date: Date = new Date()): ResolvedTimeOfDay {
  const h = date.getHours();
  if (h >= 5 && h < 10) return 'pagi';
  if (h >= 10 && h < 15) return 'siang';
  if (h >= 15 && h < 18) return 'sore';
  return 'malam';
}

function formatClock(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function pickRandomIndices(count = 5, bankSize = 125): number[] {
  const arr = Array.from({ length: bankSize }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

export default function App() {
  const [enteredCity, setEnteredCity] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [isSpectator, setIsSpectator] = useState(false);
  const [spectatorFollowId, setSpectatorFollowId] = useState<string | null>(null);

  // Admin Guru state
  const [adminPass, setAdminPass] = useState<string>('');
  const [adminAuthPromptOpen, setAdminAuthPromptOpen] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminPassError, setAdminPassError] = useState<string | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [teacherPanelOpen, setTeacherPanelOpen] = useState(false);
  const [localFrozen, setLocalFrozen] = useState(false);
  const [adminFrozenAll, setAdminFrozenAll] = useState(false);
  const [globalFrozenByAdmin, setGlobalFrozenByAdmin] = useState(false);
  const [adminAnnouncement, setAdminAnnouncement] = useState<string | null>(null);

  const [identity, setIdentity] = useState<PlayerIdentity>(loadLocalIdentity);
  const [progress, setProgress] = useState<PlayerProgress>(loadLocalProgress);
  const [teacherEmail, setTeacherEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('kota3d_teacher_email') || DEFAULT_TEACHER_EMAIL;
    } catch {
      return DEFAULT_TEACHER_EMAIL;
    }
  });

  // Google Auth UI state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // 3D Engine & Spatial State
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<Kota3DEngine | null>(null);
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number; z: number; rotY: number }>({
    x: 0,
    y: 0,
    z: 34,
    rotY: Math.PI
  });
  const [activeBuildingId, setActiveBuildingId] = useState<BuildingId | null>(null);
  const [nearby, setNearby] = useState<
    | { kind: 'building'; building: BuildingDef }
    | { kind: 'station'; stationId: StationId; label: string }
    | null
  >(null);

  // Atmosphere (Weather + Real-Time Clock & Time of Day)
  const [weatherMode, setWeatherMode] = useState<'auto' | WeatherType>('auto');
  const [liveWeather, setLiveWeather] = useState<WeatherType>('Cerah');
  const [temperatureC, setTemperatureC] = useState<number>(29);
  const [weatherRefreshing, setWeatherRefreshing] = useState(false);
  const [timeMode, setTimeMode] = useState<TimeOfDayMode>('auto');
  const [nowTime, setNowTime] = useState<Date>(() => new Date());
  const [weatherMenuOpen, setWeatherMenuOpen] = useState(false);
  const weatherCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  // Controls & Audio
  const [mobileSprint, setMobileSprint] = useState(false);
  const [showDesktopJoystick, setShowDesktopJoystick] = useState(false);
  const [mobileFullscreen, setMobileFullscreen] = useState(false);
  const [voiceOn, setVoiceOn] = useState(() => voice.isEnabled());
  const [musicOn, setMusicOn] = useState(() => sound.isMusicEnabled());

  // Modals
  const [stationModal, setStationModal] = useState<{
    building: BuildingDef;
    station: StationId;
  } | null>(null);
  const [versusModalOpen, setVersusModalOpen] = useState(false);
  const [avatarStudioOpen, setAvatarStudioOpen] = useState(false);
  const [onlineModalOpen, setOnlineModalOpen] = useState(false);
  const [sheetGuruOpen, setSheetGuruOpen] = useState(false);

  // Multiplayer & Versus Duel
  const wsRef = useRef<WebSocket | null>(null);
  const [tabSessionId] = useState<string>(() => getTabSessionId());
  const onlineId = useMemo(() => `${identity.uid}__${tabSessionId}`, [identity.uid, tabSessionId]);
  const [serverPlayers, setServerPlayers] = useState<OnlinePlayer[]>([]);
  const [firestorePlayers, setFirestorePlayers] = useState<OnlinePlayer[]>([]);
  const [pendingInvite, setPendingInvite] = useState<{
    challengerId: string;
    challengerName: string;
    challengerClass: string;
    challengerSchool: string;
  } | null>(null);
  const [activeDuel, setActiveDuel] = useState<ActiveDuelState | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const activeBuildingRef = useRef<BuildingId | null>(null);
  activeBuildingRef.current = activeBuildingId;
  const isSpectatorRef = useRef(isSpectator);
  isSpectatorRef.current = userRole === 'admin' && isSpectator;
  const userRoleRef = useRef<UserRole>(userRole);
  userRoleRef.current = userRole;
  const isMovingRef = useRef(false);
  const identityRef = useRef(identity);
  identityRef.current = identity;
  const progressRef = useRef(progress);
  progressRef.current = progress;

  // Merge WS/HTTP server players with Firestore cross-URL/cross-pod players without duplicates
  const onlinePlayers = useMemo(() => {
    const map = new Map<string, OnlinePlayer>();
    for (const p of serverPlayers) {
      if (p.id !== onlineId) {
        map.set(p.id, p);
      }
    }
    for (const fp of firestorePlayers) {
      if (fp.id !== onlineId && !map.has(fp.id)) {
        map.set(fp.id, fp);
      }
    }
    return Array.from(map.values());
  }, [serverPlayers, firestorePlayers, onlineId]);

  const resolvedWeather: WeatherType = weatherMode === 'auto' ? liveWeather : weatherMode;
  const resolvedTime: ResolvedTimeOfDay = timeMode === 'auto' ? resolveAutoTime(nowTime) : timeMode;
  const clockLabel = useMemo(() => formatClock(nowTime), [nowTime]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  useEffect(() => {
    testFirestoreConnection().catch(() => {});
  }, []);

  // Real-time local clock tick every 10s so Pagi/Siang/Sore/Malam updates automatically
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTime(new Date());
    }, 10000);
    return () => window.clearInterval(timer);
  }, []);

  const refreshWeather = useCallback(async (forceGeo = false) => {
    setWeatherRefreshing(true);
    const fetchWeather = async (lat?: number, lon?: number) => {
      try {
        const qs =
          lat !== undefined && lon !== undefined
            ? `?lat=${lat}&lon=${lon}&t=${Date.now()}`
            : `?t=${Date.now()}`;
        const res = await fetch(`/api/weather${qs}`);
        if (!res.ok) return;
        const json = (await res.json()) as { weather?: WeatherType; temperatureC?: number };
        if (json.weather) {
          setLiveWeather(json.weather);
          if (typeof json.temperatureC === 'number') setTemperatureC(json.temperatureC);
        }
      } catch {
        // Fallback to current weather
      } finally {
        setWeatherRefreshing(false);
      }
    };

    if (!forceGeo && weatherCoordsRef.current) {
      await fetchWeather(weatherCoordsRef.current.lat, weatherCoordsRef.current.lon);
      return;
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          weatherCoordsRef.current = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => fetchWeather(),
        { timeout: 4000 }
      );
    } else {
      await fetchWeather();
    }
  }, []);

  // Fetch local real-time weather on mount + refresh every 3 minutes automatically
  useEffect(() => {
    refreshWeather(true);
    const interval = window.setInterval(() => {
      refreshWeather(false);
    }, 180000);
    return () => window.clearInterval(interval);
  }, [refreshWeather]);

  const persistIdentityAndProgress = useCallback(
    async (nextId: PlayerIdentity, nextProg: PlayerProgress) => {
      try {
        localStorage.setItem('kota3d_identity', JSON.stringify(nextId));
        localStorage.setItem('kota3d_progress', JSON.stringify(nextProg));
      } catch {
        // ignore storage errors
      }
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: nextId.uid,
          name: nextId.name,
          school: nextId.school,
          className: nextId.className,
          shirtColor: nextId.shirtColor,
          pantsColor: nextId.pantsColor,
          hairColor: nextId.hairColor,
          hatStyle: nextId.hatStyle,
          companion: nextId.companion,
          completedQuestions: nextProg.completedQuestions,
          completedContoh: nextProg.completedContoh,
          completedSteps: nextProg.completedSteps,
          chapterMastery: nextProg.chapterMastery,
          bintangBersama: nextProg.bintangBersama,
          versusWins: nextProg.versusWins,
          level: nextProg.level
        })
      }).catch(() => {});

      if (auth.currentUser && nextId.isGoogleUser) {
        saveCloudProgress(nextId, nextProg).catch(() => {});
      }
    },
    []
  );

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setMobileFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const enterMobileFullscreen = async () => {
    sound.click();
    setMobileFullscreen(true);
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      // graceful fallback
    }
  };

  const exitMobileFullscreen = async () => {
    sound.click();
    setMobileFullscreen(false);
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
      }
    } catch {
      // ignore
    }
  };

  // Standard Google Login (NO Drive/Sheets scopes at login so other Google accounts aren't blocked)
  const handleGoogleLogin = async (draft: {
    name: string;
    school: string;
    className: string;
    shirtColor: string;
    companion: CompanionId;
  }) => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const { user } = await signInWithGoogleBasic();
      const cloud = await loadCloudProgress(user.uid).catch(() => null);
      const serverRes = await fetch(`/api/progress?uid=${encodeURIComponent(user.uid)}`)
        .then((r) => (r.ok ? r.json() : { progress: null }))
        .catch(() => ({ progress: null }));

      const mergedIdentity: PlayerIdentity = {
        ...DEFAULT_IDENTITY,
        ...identity,
        uid: user.uid,
        name: cloud?.identity?.name || user.displayName || draft.name,
        school: cloud?.identity?.school || draft.school,
        className: cloud?.identity?.className || draft.className,
        shirtColor: cloud?.identity?.shirtColor || draft.shirtColor,
        pantsColor: cloud?.identity?.pantsColor || identity.pantsColor,
        hairColor: cloud?.identity?.hairColor || identity.hairColor,
        hatStyle: cloud?.identity?.hatStyle || identity.hatStyle,
        companion: cloud?.identity?.companion || draft.companion,
        isGoogleUser: true,
        email: user.email || undefined
      };

      const cloudProg = cloud?.progress || serverRes?.progress;
      const mergedQuestions = Array.from(
        new Set([...(progress.completedQuestions || []), ...(cloudProg?.completedQuestions || [])])
      );
      const mergedProgress: PlayerProgress = {
        ...DEFAULT_PROGRESS,
        ...progress,
        ...(cloudProg || {}),
        completedQuestions: mergedQuestions,
        chapterMastery: {
          bilangan: Math.max(progress.chapterMastery.bilangan, cloudProg?.chapterMastery?.bilangan || 0),
          geometri: Math.max(progress.chapterMastery.geometri, cloudProg?.chapterMastery?.geometri || 0),
          pengukuran: Math.max(progress.chapterMastery.pengukuran, cloudProg?.chapterMastery?.pengukuran || 0),
          data: Math.max(progress.chapterMastery.data, cloudProg?.chapterMastery?.data || 0),
          strategi: Math.max(progress.chapterMastery.strategi, cloudProg?.chapterMastery?.strategi || 0)
        },
        bintangBersama: Math.max(progress.bintangBersama, cloudProg?.bintangBersama || 0),
        versusWins: Math.max(progress.versusWins, cloudProg?.versusWins || 0),
        level: Math.max(progress.level, cloudProg?.level || 1, 1 + Math.floor(mergedQuestions.length / 4))
      };

      setIdentity(mergedIdentity);
      setProgress(mergedProgress);
      setUserRole('student');
      setIsSpectator(false);
      await persistIdentityAndProgress(mergedIdentity, mergedProgress);
      sound.clap();
      setEnteredCity(true);
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Gagal masuk dengan Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Direct Student Login (deterministic UID by Name+School+Class so progress also persists across sessions)
  const handleGuestEnter = async (draft: {
    name: string;
    school: string;
    className: string;
    shirtColor: string;
    companion: CompanionId;
  }) => {
    const detUid = makeDeterministicStudentUid(draft.name, draft.school, draft.className);
    const serverRes = await fetch(`/api/progress?uid=${encodeURIComponent(detUid)}`)
      .then((r) => (r.ok ? r.json() : { progress: null }))
      .catch(() => ({ progress: null }));

    const nextId: PlayerIdentity = {
      ...identity,
      uid: detUid,
      name: draft.name,
      school: draft.school,
      className: draft.className,
      shirtColor: draft.shirtColor,
      companion: draft.companion,
      isGoogleUser: false
    };

    const serverProg = serverRes?.progress as Partial<PlayerProgress> | null;
    const mergedQuestions = Array.from(
      new Set([...(progress.completedQuestions || []), ...(serverProg?.completedQuestions || [])])
    );
    const nextProg: PlayerProgress = {
      ...progress,
      ...(serverProg || {}),
      completedQuestions: mergedQuestions,
      chapterMastery: {
        bilangan: Math.max(progress.chapterMastery.bilangan, serverProg?.chapterMastery?.bilangan || 0),
        geometri: Math.max(progress.chapterMastery.geometri, serverProg?.chapterMastery?.geometri || 0),
        pengukuran: Math.max(progress.chapterMastery.pengukuran, serverProg?.chapterMastery?.pengukuran || 0),
        data: Math.max(progress.chapterMastery.data, serverProg?.chapterMastery?.data || 0),
        strategi: Math.max(progress.chapterMastery.strategi, serverProg?.chapterMastery?.strategi || 0)
      },
      bintangBersama: Math.max(progress.bintangBersama, serverProg?.bintangBersama || 0),
      versusWins: Math.max(progress.versusWins, serverProg?.versusWins || 0),
      level: Math.max(progress.level, serverProg?.level || 1, 1 + Math.floor(mergedQuestions.length / 4))
    };

    setIdentity(nextId);
    setProgress(nextProg);
    setUserRole('student');
    setIsSpectator(false);
    await persistIdentityAndProgress(nextId, nextProg);
    setEnteredCity(true);
  };

  // Verify Teacher Admin Password (smpbhy07#123)
  const verifyAdminPassword = async (password: string): Promise<{ ok: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        return { ok: false, message: data.message || 'Sandi Admin Guru salah.' };
      }
      setAdminPass(password);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Gagal terhubung ke server verifikasi.' };
    }
  };

  const handleEnterAdminFromLogin = async (password: string) => {
    const check = await verifyAdminPassword(password);
    if (!check.ok) return check;
    const adminId: PlayerIdentity = {
      ...DEFAULT_IDENTITY,
      uid: `guru_${Math.random().toString(36).slice(2, 8)}`,
      name: 'Admin Guru',
      school: 'SMP Kemala Bhayangkari 7 Porong',
      className: 'GURU',
      shirtColor: '#D97706',
      hatStyle: 'topi-juara',
      companion: 'garuda',
      isGoogleUser: false
    };
    setIdentity(adminId);
    setUserRole('admin');
    setIsSpectator(false);
    setEnteredCity(true);
    setAdminModalOpen(true);
    return { ok: true };
  };

  // Mount & Manage Three.js Kota3DEngine
  useEffect(() => {
    if (!enteredCity || !canvasHostRef.current) return;

    const engine = new Kota3DEngine(
      canvasHostRef.current,
      {
        shirtColor: identity.shirtColor,
        pantsColor: identity.pantsColor,
        hairColor: identity.hairColor,
        hatStyle: identity.hatStyle,
        companion: identity.companion
      },
      {
        name: identity.name,
        className: identity.className,
        level: progress.level,
        progressText: `${progress.completedQuestions.length}/25 Soal`
      },
      {
        onNearbyChange: (nb) => setNearby(nb),
        onJump: () => sound.pop(),
        onPlayerMove: (x, y, z, rotY, moving) => {
          isMovingRef.current = moving;
          setPlayerPos({ x, y, z, rotY });
          const ws = wsRef.current;
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'move',
                x,
                y,
                z,
                rotY,
                moving,
                insideBuildingId: isSpectatorRef.current ? '' : activeBuildingRef.current || ''
              })
            );
          }
        },
        onEnterBuilding: (bId) => {
          setActiveBuildingId(bId);
        },
        onExitBuilding: () => {
          setActiveBuildingId(null);
        }
      }
    );

    engineRef.current = engine;
    if (userRoleRef.current === 'admin' && isSpectatorRef.current) {
      engine.setSpectatorMode(true, null);
    }

    for (const b of CITY_BUILDINGS) {
      if (b.isVersus) continue;
      const cid = b.id as ChapterId;
      const done = b.questionIds.every((qid) => progress.completedQuestions.includes(qid));
      engine.updateBuildingProgress(b.id, done, progress.chapterMastery[cid] || 0);
    }

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteredCity]);

  // Ensure non-admin users can never remain in Spectator mode
  useEffect(() => {
    if (userRole !== 'admin' && isSpectator) {
      setIsSpectator(false);
      setSpectatorFollowId(null);
    }
  }, [userRole, isSpectator]);

  // Sync Spectator mode toggle (Admin Guru only) to engine + network
  useEffect(() => {
    if (!enteredCity) return;
    const effectiveSpectator = userRole === 'admin' && isSpectator;
    engineRef.current?.setSpectatorMode(effectiveSpectator, spectatorFollowId);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'profile_update',
          player: { isSpectator: effectiveSpectator }
        })
      );
    }
  }, [enteredCity, userRole, isSpectator, spectatorFollowId]);

  useEffect(() => {
    engineRef.current?.applyAtmosphere(resolvedTime, resolvedWeather);
  }, [resolvedTime, resolvedWeather]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.updateAppearance({
      shirtColor: identity.shirtColor,
      pantsColor: identity.pantsColor,
      hairColor: identity.hairColor,
      hatStyle: identity.hatStyle,
      companion: identity.companion
    });
    engine.updateNameplate(
      identity.name,
      identity.className,
      progress.level,
      `${progress.completedQuestions.length}/25 Soal`
    );
    for (const b of CITY_BUILDINGS) {
      if (b.isVersus) continue;
      const cid = b.id as ChapterId;
      const done = b.questionIds.every((qid) => progress.completedQuestions.includes(qid));
      engine.updateBuildingProgress(b.id, done, progress.chapterMastery[cid] || 0);
    }
  }, [identity, progress]);

  useEffect(() => {
    engineRef.current?.syncRemotePlayers(onlinePlayers, onlineId);
  }, [onlinePlayers, onlineId]);

  // Dual-Layer Real-Time Multiplayer: WebSocket (/ws) + 1s HTTP Heartbeat + Firestore (/players for verified Google users)
  useEffect(() => {
    if (!enteredCity) return;
    let closed = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const buildHeartbeatPayload = () => {
      const idn = identityRef.current;
      const prog = progressRef.current;
      const pos = engineRef.current?.getPlayerPosition() || playerPos;
      return {
        id: onlineId,
        name: idn.name,
        school: idn.school,
        className: idn.className,
        shirtColor: idn.shirtColor,
        pantsColor: idn.pantsColor,
        hairColor: idn.hairColor,
        hatStyle: idn.hatStyle,
        companion: idn.companion,
        x: pos.x,
        y: pos.y,
        z: pos.z,
        rotY: pos.rotY,
        moving: isMovingRef.current,
        level: prog.level,
        completedCount: prog.completedQuestions.length,
        insideBuildingId: isSpectatorRef.current ? '' : activeBuildingRef.current || '',
        isSpectator: userRoleRef.current === 'admin' && isSpectatorRef.current
      };
    };

    const sendHttpHeartbeat = () => {
      fetch('/api/multiplayer/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildHeartbeatPayload())
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { players?: OnlinePlayer[] } | null) => {
          if (data?.players && !closed) {
            setServerPlayers(data.players.filter((p) => p.id !== onlineId));
          }
        })
        .catch(() => {});
    };

    const connectWs = () => {
      if (closed) return;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'join',
            player: buildHeartbeatPayload()
          })
        );
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(String(ev.data)) as { type: string; [key: string]: unknown };
          if (msg.type === 'players_snapshot') {
            const list = (msg.players as OnlinePlayer[]) || [];
            setServerPlayers(list.filter((p) => p.id !== onlineId));
          } else if (msg.type === 'player_joined') {
            const p = msg.player as OnlinePlayer;
            if (p.id === onlineId) return;
            setServerPlayers((prev) => [...prev.filter((x) => x.id !== p.id), p]);
          } else if (msg.type === 'player_moved') {
            const id = String(msg.id);
            if (id === onlineId) return;
            setServerPlayers((prev) =>
              prev.map((p) =>
                p.id === id
                  ? {
                      ...p,
                      x: Number(msg.x ?? p.x),
                      y: Number(msg.y ?? p.y),
                      z: Number(msg.z ?? p.z),
                      rotY: Number(msg.rotY ?? p.rotY),
                      moving: Boolean(msg.moving),
                      insideBuildingId: String(msg.insideBuildingId ?? '')
                    }
                  : p
              )
            );
          } else if (msg.type === 'player_updated') {
            const p = msg.player as OnlinePlayer;
            if (p.id === onlineId) return;
            setServerPlayers((prev) => prev.map((x) => (x.id === p.id ? p : x)));
          } else if (msg.type === 'player_left') {
            const id = String(msg.id);
            setServerPlayers((prev) => prev.filter((x) => x.id !== id));
          } else if (msg.type === 'versus_invite') {
            sound.ding();
            setPendingInvite({
              challengerId: String(msg.challengerId),
              challengerName: String(msg.challengerName),
              challengerClass: String(msg.challengerClass),
              challengerSchool: String(msg.challengerSchool)
            });
          } else if (msg.type === 'versus_declined') {
            showToast(`${String(msg.byName || 'Teman')} belum bisa duel sekarang.`);
          } else if (msg.type === 'versus_start') {
            const opp = msg.opponent as { id: string; name: string; className: string };
            setPendingInvite(null);
            setStationModal(null);
            setOnlineModalOpen(false);
            setActiveDuel({
              mode: 'pvp',
              roomId: String(msg.roomId),
              questionIndices: (msg.questionIndices as number[]) || pickRandomIndices(5, 125),
              opponentName: opp.name,
              opponentClass: opp.className,
              opponentScore: 0,
              opponentProgress: 0,
              opponentFinished: false
            });
            setVersusModalOpen(true);
            sound.clap();
          } else if (msg.type === 'versus_opponent_update') {
            setActiveDuel((prev) =>
              prev && prev.roomId === msg.roomId
                ? {
                    ...prev,
                    opponentScore: Number(msg.opponentScore ?? prev.opponentScore),
                    opponentProgress: Number(msg.opponentProgress ?? prev.opponentProgress),
                    opponentFinished: Boolean(msg.opponentFinished)
                  }
                : prev
            );
          } else if (msg.type === 'versus_finished') {
            setActiveDuel((prev) =>
              prev && prev.roomId === msg.roomId
                ? { ...prev, winnerId: String(msg.winnerId || '') }
                : prev
            );
          } else if (msg.type === 'admin_event') {
            const action = String(msg.action || '');
            if (action === 'freeze') {
              if (userRoleRef.current !== 'admin') {
                setGlobalFrozenByAdmin(Boolean(msg.frozen));
              }
            } else if (action === 'announcement') {
              const text = String(msg.message || '');
              if (text) {
                sound.ding();
                setAdminAnnouncement(text);
                if (Boolean(msg.speak)) {
                  voice.speak(`Pengumuman dari Guru: ${text}`, true);
                }
              }
            }
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        if (!closed) {
          window.setTimeout(connectWs, 2500);
        }
      };
    };

    connectWs();
    sendHttpHeartbeat();
    const hb = window.setInterval(sendHttpHeartbeat, 1000);

    // Universal Firestore cross-URL & cross-instance sync (Guest, Google, and Admin Guru)
    let lastFsPushMs = 0;
    const unsubFirestore = subscribeOnlinePlayersFirestore(onlineId, (list) => {
      if (!closed) setFirestorePlayers(list);
    });

    const pushFirestorePos = (force = false) => {
      if (closed) return;
      const now = Date.now();
      if (!force && now - lastFsPushMs < (isMovingRef.current ? 850 : 2200)) return;
      lastFsPushMs = now;
      const idn = identityRef.current;
      const prog = progressRef.current;
      const pos = engineRef.current?.getPlayerPosition() || playerPos;
      upsertOnlinePlayerFirestore(onlineId, {
        name: idn.name,
        school: idn.school,
        className: idn.className,
        shirtColor: idn.shirtColor,
        pantsColor: idn.pantsColor,
        hairColor: idn.hairColor,
        hatStyle: idn.hatStyle,
        companion: idn.companion,
        x: pos.x,
        y: pos.y,
        z: pos.z,
        rotY: pos.rotY,
        level: prog.level,
        completedCount: prog.completedQuestions.length,
        insideBuildingId: isSpectatorRef.current ? '' : activeBuildingRef.current || '',
        isSpectator: userRoleRef.current === 'admin' && isSpectatorRef.current
      }).catch(() => {});
    };

    pushFirestorePos(true);
    const fsTimer = window.setInterval(() => pushFirestorePos(false), 850);

    const handleBeforeUnload = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'leave' }));
      }
      removeOnlinePlayerFirestore(onlineId).catch(() => {});
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      closed = true;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.clearInterval(hb);
      window.clearInterval(fsTimer);
      unsubFirestore();
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'leave' }));
      }
      wsRef.current?.close();
      removeOnlinePlayerFirestore(onlineId).catch(() => {});
      setServerPlayers([]);
      setFirestorePlayers([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteredCity, onlineId]);

  const checkBuildingBan = useCallback((bId: BuildingId): boolean => {
    try {
      const raw = localStorage.getItem(`kota3d_bans_${identity.uid}_${bId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.bannedUntil > Date.now()) {
          const remainingSec = Math.ceil((parsed.bannedUntil - Date.now()) / 1000);
          const mins = Math.floor(remainingSec / 60);
          const secs = remainingSec % 60;
          showToast(`Gedung terkunci sementara karena sanksi kecurangan (pindah tab)! Sisa ban: ${mins}m ${secs}s (Pelanggaran ke-${parsed.offenseCount}). Anda masih bisa mengerjakan di gedung lain.`);
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  }, [identity.uid, showToast]);

  const triggerNearbyAction = useCallback(() => {
    if (!nearby || !engineRef.current || isSpectator) return;
    sound.unlock();
    sound.pop();
    if (nearby.kind === 'building') {
      const b = nearby.building;
      if (b.isVersus) {
        setActiveDuel(null);
        setVersusModalOpen(true);
      } else {
        if (userRole === 'student' && checkBuildingBan(b.id)) {
          return;
        }
        const cid = b.id as ChapterId;
        engineRef.current.enterBuilding(b.id, progress.chapterMastery[cid] || 0);
        showToast(`Masuk ke ${b.title}! Jalan ke 4 meja di dalam ruangan.`);
      }
    } else if (nearby.kind === 'station') {
      if (nearby.stationId === 'keluar') {
        engineRef.current.exitBuilding();
      } else if (activeBuildingId) {
        const bDef = CITY_BUILDINGS.find((b) => b.id === activeBuildingId);
        if (bDef) {
          setStationModal({ building: bDef, station: nearby.stationId });
        }
      }
    }
  }, [nearby, activeBuildingId, isSpectator, progress.chapterMastery, showToast, userRole, checkBuildingBan]);

  useEffect(() => {
    if (!enteredCity) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (
        stationModal ||
        versusModalOpen ||
        avatarStudioOpen ||
        onlineModalOpen ||
        sheetGuruOpen ||
        adminModalOpen ||
        adminAuthPromptOpen
      ) {
        return;
      }
      if (e.code === 'KeyE' || e.code === 'Enter') {
        if (nearby && !isSpectator) {
          e.preventDefault();
          triggerNearbyAction();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    enteredCity,
    nearby,
    isSpectator,
    stationModal,
    versusModalOpen,
    avatarStudioOpen,
    onlineModalOpen,
    sheetGuruOpen,
    adminModalOpen,
    adminAuthPromptOpen,
    triggerNearbyAction
  ]);

  const handleCompleteQuestion = useCallback(
    (qid: number, chapterId: ChapterId, isContoh: boolean) => {
      setProgress((prev) => {
        const nextContoh = isContoh
          ? Array.from(new Set([...prev.completedContoh, qid]))
          : prev.completedContoh;
        const nextCompleted = !isContoh
          ? Array.from(new Set([...prev.completedQuestions, qid]))
          : prev.completedQuestions;
        const incMastery = !isContoh && !prev.completedQuestions.includes(qid) ? 2 : isContoh ? 0 : 1;
        const nextMastery = Math.min(10, (prev.chapterMastery[chapterId] || 0) + incMastery);
        const nextBintang = prev.bintangBersama + (isContoh ? 0 : 1);
        const nextLevel = Math.max(prev.level, 1 + Math.floor((nextCompleted.length + prev.versusWins) / 3));

        const nextProg: PlayerProgress = {
          ...prev,
          completedContoh: nextContoh,
          completedQuestions: nextCompleted,
          chapterMastery: {
            ...prev.chapterMastery,
            [chapterId]: nextMastery
          },
          bintangBersama: nextBintang,
          level: nextLevel
        };
        persistIdentityAndProgress(identity, nextProg);
        return nextProg;
      });
    },
    [identity, persistIdentityAndProgress]
  );

  const handleSubmitArchive = useCallback(
    async (payload: {
      chapterId: ChapterId;
      chapterTitle: string;
      questionLabel: string;
      pgScore: number;
      reflectionText: string;
      syncedToSheet: boolean;
    }) => {
      const archiveId = `arc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const entry = {
        id: archiveId,
        uid: identity.uid,
        studentName: identity.name,
        school: identity.school,
        className: identity.className,
        chapterId: payload.chapterId,
        chapterTitle: payload.chapterTitle,
        questionLabel: payload.questionLabel,
        pgScore: payload.pgScore,
        reflectionText: payload.reflectionText,
        syncedToSheet: payload.syncedToSheet,
        createdAt: new Date().toISOString()
      };

      await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      }).catch(() => {});

      if (auth.currentUser && identity.isGoogleUser) {
        saveCloudArchive(entry).catch(() => {});
      }

      setProgress((prev) => {
        const nextMastery = Math.min(10, (prev.chapterMastery[payload.chapterId] || 0) + 2);
        const nextProg: PlayerProgress = {
          ...prev,
          chapterMastery: {
            ...prev.chapterMastery,
            [payload.chapterId]: nextMastery
          },
          bintangBersama: prev.bintangBersama + 1
        };
        persistIdentityAndProgress(identity, nextProg);
        return nextProg;
      });
    },
    [identity, persistIdentityAndProgress]
  );

  const handleSaveAppearance = (app: AvatarAppearance) => {
    const nextId: PlayerIdentity = { ...identity, ...app };
    setIdentity(nextId);
    persistIdentityAndProgress(nextId, progress);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'profile_update',
          player: {
            ...app,
            level: progress.level,
            completedCount: progress.completedQuestions.length
          }
        })
      );
    }
  };

  const handleChallengeOnline = (target: OnlinePlayer) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      showToast('Koneksi WebSocket sedang menyambung ulang. Coba sebentar lagi atau lawan Bot!');
      return;
    }
    wsRef.current.send(
      JSON.stringify({
        type: 'versus_challenge',
        targetId: target.id
      })
    );
    showToast(`Undangan Duel 1v1 dikirim ke ${target.name}!`);
  };

  const handleRespondInvite = (accepted: boolean) => {
    if (!pendingInvite || !wsRef.current) return;
    wsRef.current.send(
      JSON.stringify({
        type: 'versus_response',
        challengerId: pendingInvite.challengerId,
        accepted
      })
    );
    setPendingInvite(null);
  };

  const handleOpenAdminFromHud = () => {
    sound.click();
    if (userRole === 'admin' && adminPass) {
      setAdminModalOpen(true);
    } else {
      setAdminPassError(null);
      setAdminPassInput('');
      setAdminAuthPromptOpen(true);
    }
  };

  const handleBroadcastFreeze = (freeze: boolean) => {
    setAdminFrozenAll(freeze);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'admin_broadcast',
          adminPass,
          action: 'freeze',
          frozen: freeze
        })
      );
    }
  };

  const handleBroadcastAnnouncement = (text: string, speak: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'admin_broadcast',
          adminPass,
          action: 'announcement',
          message: text,
          speak
        })
      );
    }
    setAdminAnnouncement(text);
    if (speak) voice.speak(`Pengumuman dari Guru: ${text}`, true);
  };

  const activeWeatherIcon = useMemo(() => {
    if (resolvedWeather === 'Hujan') return <CloudRain className="w-4 h-4 text-sky-400" />;
    if (resolvedWeather === 'Badai') return <CloudLightning className="w-4 h-4 text-amber-300" />;
    if (resolvedWeather === 'Berawan') return <Cloud className="w-4 h-4 text-slate-300" />;
    if (resolvedTime === 'malam') return <Moon className="w-4 h-4 text-indigo-300" />;
    if (resolvedTime === 'pagi') return <Sunrise className="w-4 h-4 text-amber-300" />;
    if (resolvedTime === 'sore') return <Sunset className="w-4 h-4 text-orange-400" />;
    return <Sun className="w-4 h-4 text-amber-400" />;
  }, [resolvedWeather, resolvedTime]);

  const nonSpectatorPlayers = useMemo(
    () => onlinePlayers.filter((p) => !p.isSpectator),
    [onlinePlayers]
  );

  if (!enteredCity) {
    return (
      <LoginScreen
        initialIdentity={identity}
        googleLoading={googleLoading}
        googleError={googleError}
        onGoogleLogin={handleGoogleLogin}
        onGuestEnter={handleGuestEnter}
        onEnterAdminGuru={handleEnterAdminFromLogin}
      />
    );
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-950 select-none">
      {/* Three.js 3D WebGL Canvas Host */}
      <div ref={canvasHostRef} className="absolute inset-0 w-full h-full" />

      {/* Mobile Fullscreen Active State: Keep Compact Minimap at Top-Left + Exit ("Normal") at Top-Right */}
      {mobileFullscreen && (
        <>
          <div className="fixed top-3 left-3 z-30">
            <MinimapRadar
              compact
              playerPos={playerPos}
              onlinePlayers={nonSpectatorPlayers}
              completedQuestions={progress.completedQuestions}
              activeBuildingId={activeBuildingId}
              onTeleportBuilding={(bId) => {
                sound.pop();
                setSpectatorFollowId(null);
                engineRef.current?.teleportToBuilding(bId);
                const def = CITY_BUILDINGS.find((b) => b.id === bId);
                if (def) showToast(`Teleport ke depan ${def.title}`);
              }}
            />
          </div>
          <div className="fixed top-3 right-3 z-30">
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                exitMobileFullscreen();
              }}
              className="min-h-[42px] px-3.5 rounded-xl bg-slate-900/92 border border-white/25 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Minimize2 className="w-4 h-4 text-amber-400" />
              <span>Normal</span>
            </button>
          </div>
        </>
      )}

      {/* Standard City HUD (Hidden during Mobile Fullscreen; NO backdrop-blur over WebGL canvas) */}
      {!mobileFullscreen && (
        <>
          {/* TOP-LEFT HUD: Minimap Radar + Identity Badge */}
          <div className="fixed top-3 left-3 z-30 flex items-start gap-2.5 max-w-[calc(100vw-160px)]">
            <MinimapRadar
              playerPos={playerPos}
              onlinePlayers={nonSpectatorPlayers}
              completedQuestions={progress.completedQuestions}
              activeBuildingId={activeBuildingId}
              onTeleportBuilding={(bId) => {
                sound.pop();
                setSpectatorFollowId(null);
                engineRef.current?.teleportToBuilding(bId);
                const def = CITY_BUILDINGS.find((b) => b.id === bId);
                if (def) showToast(`Teleport ke depan ${def.title}`);
              }}
            />

            <div className="hidden sm:flex flex-col gap-1 rounded-2xl bg-slate-900/92 border-2 border-slate-700 px-3.5 py-2.5 text-white shadow-xl">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm text-amber-300 truncate max-w-[160px]">
                  {identity.name}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-600 text-[10px] font-black font-mono-num">
                  {isSpectator ? 'SPECTATOR' : userRole === 'admin' ? 'ADMIN' : `Lv.${progress.level}`}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-semibold truncate max-w-[210px]">
                Kelas {identity.className} · {identity.school}
              </div>
              <div className="flex items-center gap-2.5 text-[11px] font-mono-num font-bold pt-0.5">
                <span className="text-emerald-400">{progress.completedQuestions.length}/25 Soal</span>
                <span className="text-amber-400">★ {progress.bintangBersama}</span>
                <span className="text-rose-400">Duel {progress.versusWins}×</span>
              </div>
            </div>
          </div>

          {/* TOP-RIGHT HUD: Weather/Time Pill + Secondary Action Buttons + Mobile-Only Fullscreen */}
          <div className="fixed top-3 right-3 z-30 flex flex-col items-end gap-2">
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {/* Mobile-Only Fullscreen Button (Hidden on lg+ desktop) */}
              <button
                type="button"
                onClick={enterMobileFullscreen}
                className="lg:hidden min-h-[40px] px-3 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                title="Mode Layar Penuh HP"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Layar Penuh</span>
              </button>

              {/* Weather & Time Toggle Pill */}
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  sound.click();
                  setWeatherMenuOpen((v) => !v);
                }}
                className="min-h-[40px] px-3 rounded-xl bg-slate-900/92 border border-slate-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                {activeWeatherIcon}
                <span className="capitalize">{resolvedWeather}</span>
                <span className="font-mono-num text-amber-300">{temperatureC}°C</span>
                <span className="hidden sm:inline text-slate-300 font-mono-num">
                  · {clockLabel} (<span className="capitalize">{resolvedTime}</span>)
                </span>
              </button>

              {/* Online Players Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  sound.click();
                  setOnlineModalOpen(true);
                }}
                className="min-h-[40px] px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Online ({nonSpectatorPlayers.length})</span>
              </button>

              {/* Direct Versus Lobby Button */}
              {!isSpectator && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    sound.click();
                    setActiveDuel(null);
                    setVersusModalOpen(true);
                  }}
                  className="min-h-[40px] px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Versus 1v1</span>
                </button>
              )}

              {/* Spectator Mode Toggle Button (Admin Guru ONLY) */}
              {userRole === 'admin' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    sound.pop();
                    setSpectatorFollowId(null);
                    setIsSpectator((s) => !s);
                  }}
                  className={`min-h-[40px] px-3 rounded-xl border font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer ${
                    isSpectator
                      ? 'bg-sky-600 border-sky-400 text-white'
                      : 'bg-slate-900/92 border-slate-700 text-white'
                  }`}
                  title="Mode Spectator Kamera Bebas (Khusus Admin Guru)"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-300" />
                  <span className="hidden sm:inline">{isSpectator ? 'Spectator ON' : 'Spectator'}</span>
                </button>
              )}

              {/* Admin Guru Button */}
              <button
                type="button"
                onClick={handleOpenAdminFromHud}
                className={`min-h-[40px] px-3 rounded-xl border font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer ${
                  userRole === 'admin'
                    ? 'bg-amber-400 border-amber-300 text-slate-950'
                    : 'bg-slate-900/92 border-slate-700 text-white'
                }`}
              >
                <Shield className={`w-3.5 h-3.5 ${userRole === 'admin' ? 'text-slate-950' : 'text-amber-400'}`} />
                <span className="hidden sm:inline">Admin Guru</span>
              </button>

              {/* Avatar Studio Button */}
              {!isSpectator && (
                <button
                  type="button"
                  onClick={() => {
                    sound.click();
                    setAvatarStudioOpen(true);
                  }}
                  className="min-h-[40px] px-3 rounded-xl bg-slate-900/92 border border-slate-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden md:inline">Avatar</span>
                </button>
              )}

              {/* Sheet Guru Button */}
              <button
                type="button"
                onClick={() => {
                  sound.click();
                  setSheetGuruOpen(true);
                }}
                className="min-h-[40px] px-3 rounded-xl bg-slate-900/92 border border-slate-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Sheet Guru</span>
              </button>
            </div>

            {/* Compact Secondary Row */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const next = !voiceOn;
                  voice.setEnabled(next);
                  setVoiceOn(next);
                  sound.click();
                }}
                title="Aktifkan/Matikan Suara Baca"
                className={`min-h-[34px] px-2.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                  voiceOn
                    ? 'bg-slate-900/92 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900/92 border-slate-700 text-slate-400'
                }`}
              >
                {voiceOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">Voice</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.unlock();
                  const next = !musicOn;
                  sound.setMusicEnabled(next);
                  setMusicOn(next);
                  sound.click();
                }}
                title="Aktifkan/Matikan Musik Latar"
                className={`min-h-[34px] px-2.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                  musicOn
                    ? 'bg-slate-900/92 border-sky-500 text-sky-300'
                    : 'bg-slate-900/92 border-slate-700 text-slate-400'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Musik</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDesktopJoystick((v) => !v)}
                className="hidden lg:flex min-h-[34px] px-2.5 rounded-lg bg-slate-900/92 border border-slate-700 text-slate-200 text-[11px] font-bold items-center gap-1 cursor-pointer"
                title="Tampilkan Joystick Sentuh untuk Layar IFP"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Joystick IFP</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  sound.click();
                  sound.stopMusic();
                  voice.stop();
                  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ type: 'leave' }));
                  }
                  removeOnlinePlayerFirestore(onlineId).catch(() => {});
                  if (identity.isGoogleUser) {
                    await signOutGoogle().catch(() => {});
                  }
                  setIsSpectator(false);
                  setSpectatorFollowId(null);
                  setUserRole('student');
                  setEnteredCity(false);
                }}
                className="min-h-[34px] px-2.5 rounded-lg bg-slate-900/92 border border-slate-700 text-slate-200 hover:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                title="Kembali ke Halaman Login"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>

            {/* Weather & Time Popover Switcher */}
            {weatherMenuOpen && (
              <div className="w-64 rounded-2xl bg-slate-900/95 border-2 border-slate-700 p-3.5 text-white shadow-2xl space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300 border-b border-slate-800 pb-2">
                  <span>Waktu Lokal: {clockLabel}</span>
                  <span className="capitalize text-amber-300">{resolvedTime}</span>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase mb-1.5">Waktu Kota 3D</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['auto', 'pagi', 'siang', 'sore', 'malam'] as TimeOfDayMode[]).map((tm) => (
                      <button
                        key={tm}
                        type="button"
                        onClick={() => {
                          sound.click();
                          setTimeMode(tm);
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-bold capitalize cursor-pointer ${
                          timeMode === tm ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {tm}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase mb-1.5">Cuaca Lokal</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['auto', 'Cerah', 'Berawan', 'Hujan', 'Badai', 'Terik'] as const).map((wm) => (
                      <button
                        key={wm}
                        type="button"
                        onClick={() => {
                          sound.click();
                          setWeatherMode(wm);
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-bold capitalize cursor-pointer ${
                          weatherMode === wm ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {wm}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={weatherRefreshing}
                  onClick={() => {
                    sound.click();
                    setWeatherMode('auto');
                    setTimeMode('auto');
                    refreshWeather(true);
                  }}
                  className="w-full min-h-[34px] px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-sky-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${weatherRefreshing ? 'animate-spin' : ''}`} />
                  <span>{weatherRefreshing ? 'Memperbarui Cuaca...' : 'Sinkron Cuaca & Jam Real-Time'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Spectator Floating Control Bar (Top-Center when Admin Guru is in Spectator mode) */}
          {userRole === 'admin' && isSpectator && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 rounded-2xl bg-slate-900/95 border-2 border-sky-400 px-4 py-2.5 text-white shadow-2xl flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-sky-300">
                <Eye className="w-4 h-4" />
                <span>MODE SPECTATOR GURU</span>
              </div>
              <select
                value={spectatorFollowId || ''}
                onChange={(e) => {
                  const val = e.target.value || null;
                  setSpectatorFollowId(val);
                  engineRef.current?.setSpectatorFollow(val);
                }}
                className="rounded-lg bg-slate-800 border border-slate-600 px-2.5 py-1 text-xs font-bold text-white"
              >
                <option value="">Terbang Bebas (Kamera Kota)</option>
                {nonSpectatorPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    Ikuti: {p.name} (Kelas {p.className})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  sound.click();
                  setIsSpectator(false);
                  setSpectatorFollowId(null);
                }}
                className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
              >
                Keluar Spectator
              </button>
            </div>
          )}
        </>
      )}

      {/* Teacher Live Announcement Banner */}
      {adminAnnouncement && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-xl rounded-2xl bg-amber-400 border-2 border-slate-900 px-4 py-3 text-slate-950 shadow-2xl flex items-center justify-between gap-3">
          <div className="text-xs sm:text-sm font-black">
            Pengumuman Guru: <span className="font-bold">{adminAnnouncement}</span>
          </div>
          <button
            type="button"
            onClick={() => setAdminAnnouncement(null)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* CENTER-TOP TOAST & DUEL INVITE BANNER */}
      {toastMsg && !mobileFullscreen && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-slate-900/95 border border-amber-400 text-white text-xs sm:text-sm font-bold shadow-xl pointer-events-none">
          {toastMsg}
        </div>
      )}

      {pendingInvite && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md rounded-2xl bg-slate-900 border-2 border-rose-500 p-4 text-white shadow-2xl space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-black text-sm">
            <Swords className="w-5 h-5" />
            <span>Tantangan Duel 1v1 Masuk!</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200">
            <strong>{pendingInvite.challengerName}</strong> (Kelas {pendingInvite.challengerClass} ·{' '}
            {pendingInvite.challengerSchool}) menantangmu berduel cepat 5 soal!
          </p>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => handleRespondInvite(false)}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold cursor-pointer"
            >
              Tolak
            </button>
            <button
              type="button"
              onClick={() => handleRespondInvite(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold cursor-pointer"
            >
              Terima & Mulai Duel!
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM-LEFT HUD: Analog Touch Joystick */}
      <div className={`fixed bottom-4 left-4 z-30 ${showDesktopJoystick ? 'block' : 'lg:hidden'}`}>
        <TouchJoystick
          onVectorChange={(x, y) => engineRef.current?.setJoystickVector(x, y)}
          sprint={mobileSprint}
          onToggleSprint={() => {
            setMobileSprint((s) => {
              const next = !s;
              engineRef.current?.setMobileSprint(next);
              return next;
            });
          }}
        />
      </div>

      {/* Desktop Controls Hint Pill */}
      {!showDesktopJoystick && !mobileFullscreen && (
        <div className="hidden lg:flex fixed bottom-4 left-4 z-30 items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-700 px-3.5 py-2 text-xs text-slate-200 font-semibold shadow-lg pointer-events-none">
          <span>WASD / Panah: {isSpectator ? 'Terbang Kamera' : 'Jalan'}</span>
          <span className="text-slate-500">·</span>
          <span>Shift: {isSpectator ? 'Cepat' : 'Lari'}</span>
          {!isSpectator && (
            <>
              <span className="text-slate-500">·</span>
              <span>Spasi: Lompat</span>
            </>
          )}
          <span className="text-slate-500">·</span>
          <span>Seret Mouse: Putar Kamera 360°</span>
          {!isSpectator && (
            <>
              <span className="text-slate-500">·</span>
              <span>E / Enter: Masuk & Interaksi</span>
            </>
          )}
        </div>
      )}

      {/* BOTTOM-RIGHT HUD: Jump Button ("Lompat") + Contextual Action Button + Quick Exit Inside Building */}
      {!isSpectator && (
        <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2">
          {activeBuildingId && !nearby && (
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                sound.pop();
                engineRef.current?.exitBuilding();
              }}
              className="min-h-[48px] px-4 rounded-2xl bg-slate-900/92 border-2 border-white/25 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl cursor-pointer"
            >
              <DoorOpen className="w-4 h-4 text-amber-400" />
              <span>Keluar ke Kota 3D</span>
            </button>
          )}

          <div className="flex items-end gap-2">
            {nearby && (
              <button
                type="button"
                onClick={(e) => {
                  e.currentTarget.blur();
                  triggerNearbyAction();
                }}
                className="min-h-[54px] px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 border-2 border-white text-slate-950 font-display font-black text-sm sm:text-base flex items-center gap-2 shadow-2xl cursor-pointer active:scale-95 transition-transform"
              >
                <span>
                  {nearby.kind === 'building'
                    ? nearby.building.isVersus
                      ? 'Masuk Arena Duel 1v1'
                      : `Masuk ${nearby.building.shortTitle}`
                    : nearby.label}
                </span>
                <span className="hidden sm:inline px-2 py-0.5 rounded bg-slate-950/15 text-xs font-mono-num">
                  E
                </span>
              </button>
            )}

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.blur();
                sound.unlock();
                engineRef.current?.setJumpHeld(true);
              }}
              onPointerUp={() => engineRef.current?.setJumpHeld(false)}
              onPointerCancel={() => engineRef.current?.setJumpHeld(false)}
              onPointerLeave={() => engineRef.current?.setJumpHeld(false)}
              className="touch-none select-none min-h-[54px] px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 border-2 border-white text-slate-950 font-display font-black text-sm flex items-center gap-1.5 shadow-2xl cursor-pointer active:scale-95 transition-transform"
              title="Lompat (Spasi di Laptop)"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.75]" />
              <span>Lompat</span>
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      {stationModal && (
        <BuildingStationModal
          building={stationModal.building}
          initialStation={stationModal.station}
          identity={identity}
          progress={progress}
          teacherEmail={teacherEmail}
          userRole={userRole}
          onCompleteQuestion={handleCompleteQuestion}
          onSubmitArchive={handleSubmitArchive}
          onClose={() => setStationModal(null)}
          onTriggerBan={(bId, offenseCount, durationMs) => {
            const mins = Math.ceil(durationMs / 60000);
            showToast(`Peringatan Kecurangan! Terdeteksi pindah tab saat mengerjakan. Anda dikick dari gedung ini dan dikenakan sanksi tidak boleh masuk selama ${mins} menit (Pelanggaran ke-${offenseCount}). Anda masih bisa mengerjakan di gedung lain!`);
          }}
        />
      )}

      {versusModalOpen && (
        <VersusModal
          identity={identity}
          onlinePlayers={nonSpectatorPlayers}
          activeDuel={activeDuel}
          onStartBotDuel={() => {
            setActiveDuel({
              mode: 'bot',
              questionIndices: pickRandomIndices(5, 125),
              opponentName: 'Bot Nusantara',
              opponentClass: 'AI Kelas 6',
              opponentScore: 0,
              opponentProgress: 0,
              opponentFinished: false
            });
          }}
          onChallengeOnline={handleChallengeOnline}
          onSubmitPvpAnswer={(roomId, round, points) => {
            wsRef.current?.send(
              JSON.stringify({
                type: 'versus_answer',
                roomId,
                round,
                points
              })
            );
          }}
          onDuelVictory={(won) => {
            if (won) {
              setProgress((prev) => {
                const nextWins = prev.versusWins + 1;
                const nextProg: PlayerProgress = {
                  ...prev,
                  versusWins: nextWins,
                  bintangBersama: prev.bintangBersama + 2,
                  level: Math.max(prev.level, 1 + Math.floor((prev.completedQuestions.length + nextWins) / 3))
                };
                persistIdentityAndProgress(identity, nextProg);
                return nextProg;
              });
            }
          }}
          onClose={() => {
            setVersusModalOpen(false);
            setActiveDuel(null);
          }}
        />
      )}

      {avatarStudioOpen && (
        <AvatarStudioModal
          current={{
            shirtColor: identity.shirtColor,
            pantsColor: identity.pantsColor,
            hairColor: identity.hairColor,
            hatStyle: identity.hatStyle,
            companion: identity.companion
          }}
          onSave={handleSaveAppearance}
          onClose={() => setAvatarStudioOpen(false)}
        />
      )}

      {onlineModalOpen && (
        <OnlinePlayersModal
          players={nonSpectatorPlayers}
          myPos={playerPos}
          onVisitPlayer={(p) => {
            setOnlineModalOpen(false);
            engineRef.current?.teleportTo(p.x + 2, p.z + 2);
            showToast(`Berpindah ke dekat ${p.name}!`);
          }}
          onChallengePlayer={(p) => {
            setOnlineModalOpen(false);
            handleChallengeOnline(p);
          }}
          onClose={() => setOnlineModalOpen(false)}
        />
      )}

      {sheetGuruOpen && (
        <SheetGuruModal
          teacherEmail={teacherEmail}
          onUpdateTeacherEmail={(email) => {
            setTeacherEmail(email);
            try {
              localStorage.setItem('kota3d_teacher_email', email);
            } catch {
              // ignore
            }
          }}
          onClose={() => setSheetGuruOpen(false)}
        />
      )}

      {adminModalOpen && (
        <AdminGuruModal
          adminPass={adminPass}
          onlinePlayers={onlinePlayers}
          isSpectator={isSpectator}
          frozenAll={adminFrozenAll}
          onToggleSpectator={() => setIsSpectator((s) => !s)}
          onSpectatePlayer={(pid) => {
            setIsSpectator(true);
            setSpectatorFollowId(pid);
            engineRef.current?.setSpectatorMode(true, pid);
            showToast('Memantau aktivitas siswa dalam Mode Spectator 3D');
          }}
          onBroadcastFreeze={handleBroadcastFreeze}
          onBroadcastAnnouncement={handleBroadcastAnnouncement}
          onOpenSheetGuru={() => setSheetGuruOpen(true)}
          onOpenTeacherPanel={() => setTeacherPanelOpen(true)}
          onClose={() => setAdminModalOpen(false)}
        />
      )}

      {teacherPanelOpen && (
        <TeacherPanel
          question={TKA_QUESTIONS[0]}
          frozen={localFrozen}
          onToggleFreeze={() => setLocalFrozen((f) => !f)}
          onClose={() => setTeacherPanelOpen(false)}
        />
      )}

      {/* Teacher Admin Password Modal inside City */}
      {adminAuthPromptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/78 flex items-center justify-center p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await verifyAdminPassword(adminPassInput);
              if (!res.ok) {
                sound.softWrong();
                setAdminPassError(res.message || 'Sandi Admin Guru salah.');
              } else {
                sound.clap();
                setUserRole('admin');
                setAdminAuthPromptOpen(false);
                setAdminModalOpen(true);
              }
            }}
            className="w-full max-w-md rounded-3xl bg-white text-slate-900 p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-black">Verifikasi Admin Guru</h3>
                <p className="text-xs text-slate-500">Masukkan sandi guru untuk membuka panel kendali.</p>
              </div>
            </div>
            <input
              type="password"
              autoFocus
              value={adminPassInput}
              onChange={(e) => setAdminPassInput(e.target.value)}
              placeholder="Sandi guru..."
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm font-semibold"
            />
            {adminPassError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-800">
                {adminPassError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdminAuthPromptOpen(false)}
                className="min-h-[40px] px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="min-h-[40px] px-5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Buka Panel Guru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student Screen Frozen Overlay (triggered by Teacher Admin or Local TeacherPanel) */}
      {(globalFrozenByAdmin || localFrozen) && (
        <div className="fixed inset-0 z-[70] bg-slate-950/92 flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="max-w-lg space-y-4">
            <h2 className="font-display text-3xl font-black text-amber-300">Layar Dibekukan oleh Guru</h2>
            <p className="text-base sm:text-lg text-slate-200">
              Ayo perhatikan penjelasan Guru di depan kelas dan berdiskusi bersama temanmu dulu!
            </p>
            {localFrozen && !globalFrozenByAdmin && (
              <button
                type="button"
                onClick={() => setLocalFrozen(false)}
                className="min-h-[48px] px-6 rounded-xl bg-amber-400 text-slate-950 font-black text-sm cursor-pointer"
              >
                Lanjutkan Layar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
