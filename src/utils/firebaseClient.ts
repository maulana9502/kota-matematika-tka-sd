import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  collection,
  query,
  where,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ArchiveRow, CompanionId, OnlinePlayer, PlayerIdentity, PlayerProgress } from '../types/game';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets'
];

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

let db: Firestore;
try {
  const dbId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
  db = dbId ? initializeFirestore(app, {}, dbId) : getFirestore(app);
} catch {
  db = getFirestore(app);
}
export { db };

// In-memory ONLY OAuth access token cache (never written to localStorage/sessionStorage)
let cachedGoogleAccessToken: string | null = null;

export function getCachedGoogleAccessToken(): string | null {
  return cachedGoogleAccessToken;
}

export function clearCachedGoogleAccessToken() {
  cachedGoogleAccessToken = null;
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedGoogleAccessToken = null;
  }
});

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

export async function signInWithGoogleBasic(): Promise<{
  user: User;
  accessToken: string | null;
}> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedGoogleAccessToken = credential.accessToken;
    }
    return { user: result.user, accessToken: cachedGoogleAccessToken };
  } catch (err) {
    const code = (err as { code?: string })?.code || '';
    const msg = err instanceof Error ? err.message : String(err);
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request'
    ) {
      throw new Error('Jendela login Google ditutup sebelum selesai. Silakan coba lagi.');
    }
    if (
      msg.includes('access_denied') ||
      msg.includes('blocked') ||
      code === 'auth/unauthorized-domain'
    ) {
      throw new Error(
        'Akses akun Google dibatasi oleh layar izin Google Cloud (mode Testing). Gunakan tombol "Masuk Langsung" di bawah agar progres tetap tersimpan di server, atau minta Admin mengubah OAuth Consent Screen ke "In Production" di Google Cloud Console.'
      );
    }
    throw err;
  }
}

export async function authorizeGoogleWorkspaceScopes(): Promise<string | null> {
  const provider = new GoogleAuthProvider();
  for (const scope of WORKSPACE_SCOPES) {
    provider.addScope(scope);
  }
  provider.setCustomParameters({ prompt: 'consent select_account' });
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedGoogleAccessToken = credential?.accessToken ?? null;
    return cachedGoogleAccessToken;
  } catch {
    return null;
  }
}

export async function signInWithGoogleWorkspace(): Promise<{
  user: User;
  accessToken: string | null;
}> {
  return signInWithGoogleBasic();
}

export async function signOutGoogle(): Promise<void> {
  cachedGoogleAccessToken = null;
  await signOut(auth);
}

export async function loadCloudProgress(uid: string): Promise<{
  identity?: Partial<PlayerIdentity>;
  progress?: Partial<PlayerProgress>;
} | null> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return null;
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      identity: {
        name: d.name,
        school: d.school,
        className: d.className,
        shirtColor: d.shirtColor,
        pantsColor: d.pantsColor,
        hairColor: d.hairColor,
        hatStyle: d.hatStyle,
        companion: d.companion
      },
      progress: {
        completedQuestions: Array.isArray(d.completedQuestions) ? d.completedQuestions : [],
        completedContoh: Array.isArray(d.completedContoh) ? d.completedContoh : [],
        completedSteps: Array.isArray(d.completedSteps) ? d.completedSteps : [],
        chapterMastery: d.chapterMastery || {
          bilangan: 0,
          geometri: 0,
          pengukuran: 0,
          data: 0,
          strategi: 0
        },
        bintangBersama: Number(d.bintangBersama || 0),
        versusWins: Number(d.versusWins || 0),
        level: Number(d.level || 1)
      }
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveCloudProgress(identity: PlayerIdentity, progress: PlayerProgress): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const uid = auth.currentUser.uid;
  const path = `users/${uid}`;
  try {
    const ref = doc(db, 'users', uid);
    const existingSnap = await getDoc(ref);
    const basePayload = {
      uid,
      name: identity.name.slice(0, 100),
      school: identity.school.slice(0, 120),
      className: identity.className.slice(0, 40),
      shirtColor: identity.shirtColor,
      pantsColor: identity.pantsColor,
      hairColor: identity.hairColor,
      hatStyle: identity.hatStyle,
      companion: identity.companion,
      completedQuestions: progress.completedQuestions.slice(0, 30),
      completedContoh: progress.completedContoh.slice(0, 30),
      completedSteps: progress.completedSteps.slice(0, 30),
      chapterMastery: {
        bilangan: Number(progress.chapterMastery.bilangan || 0),
        geometri: Number(progress.chapterMastery.geometri || 0),
        pengukuran: Number(progress.chapterMastery.pengukuran || 0),
        data: Number(progress.chapterMastery.data || 0),
        strategi: Number(progress.chapterMastery.strategi || 0)
      },
      bintangBersama: Math.min(10000, Math.max(0, Math.round(progress.bintangBersama))),
      versusWins: Math.min(10000, Math.max(0, Math.round(progress.versusWins))),
      level: Math.min(100, Math.max(1, Math.round(progress.level))),
      updatedAt: serverTimestamp()
    };

    if (!existingSnap.exists()) {
      await setDoc(ref, {
        ...basePayload,
        createdAt: serverTimestamp()
      });
    } else {
      await setDoc(
        ref,
        {
          ...basePayload,
          createdAt: existingSnap.data().createdAt || serverTimestamp()
        },
        { merge: true }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveCloudArchive(entry: ArchiveRow): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const path = `archives/${entry.id}`;
  try {
    await setDoc(doc(db, 'archives', entry.id), {
      uid: auth.currentUser.uid,
      studentName: entry.studentName.slice(0, 100),
      school: entry.school.slice(0, 120),
      className: entry.className.slice(0, 40),
      chapterId: entry.chapterId.slice(0, 40),
      chapterTitle: entry.chapterTitle.slice(0, 120),
      questionLabel: entry.questionLabel.slice(0, 120),
      pgScore: Math.min(100, Math.max(0, Math.round(entry.pgScore))),
      reflectionText: entry.reflectionText.slice(0, 2000),
      syncedToSheet: Boolean(entry.syncedToSheet),
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function loadCloudArchives(): Promise<ArchiveRow[]> {
  if (!auth.currentUser) return [];
  const path = 'archives';
  try {
    const q = query(collection(db, 'archives'), where('uid', '==', auth.currentUser.uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      const ts = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
      return {
        id: d.id,
        uid: data.uid,
        studentName: data.studentName,
        school: data.school,
        className: data.className,
        chapterId: data.chapterId,
        chapterTitle: data.chapterTitle,
        questionLabel: data.questionLabel,
        pgScore: Number(data.pgScore || 0),
        reflectionText: data.reflectionText || '',
        syncedToSheet: Boolean(data.syncedToSheet),
        createdAt: ts
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function upsertOnlinePlayerFirestore(params: {
  name: string;
  school: string;
  className: string;
  shirtColor: string;
  companion: CompanionId;
  x: number;
  y: number;
  z: number;
  rotY: number;
  level: number;
  completedCount: number;
  insideBuildingId: string;
}): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const uid = auth.currentUser.uid;
  try {
    await setDoc(doc(db, 'players', uid), {
      uid,
      name: params.name.slice(0, 100) || 'Siswa',
      school: params.school.slice(0, 120) || 'Sekolah',
      className: params.className.slice(0, 40) || '6',
      shirtColor: params.shirtColor.slice(0, 20) || '#2563EB',
      companion: params.companion,
      x: Math.max(-190, Math.min(190, Number(params.x) || 0)),
      y: Math.max(-15, Math.min(45, Number(params.y) || 0)),
      z: Math.max(-190, Math.min(190, Number(params.z) || 0)),
      rotY: Math.max(-9.5, Math.min(9.5, Number(params.rotY) || 0)),
      level: Math.max(1, Math.min(100, Math.round(params.level || 1))),
      completedCount: Math.max(0, Math.min(50, Math.round(params.completedCount || 0))),
      insideBuildingId: (params.insideBuildingId || '').slice(0, 40),
      updatedAt: serverTimestamp()
    });
  } catch {
    // Non-fatal fallback to WS/HTTP
  }
}

export async function removeOnlinePlayerFirestore(): Promise<void> {
  if (!auth.currentUser) return;
  try {
    await deleteDoc(doc(db, 'players', auth.currentUser.uid));
  } catch {
    // Ignore
  }
}

export function subscribeOnlinePlayersFirestore(
  onPlayers: (players: OnlinePlayer[]) => void
): () => void {
  if (!auth.currentUser) return () => {};
  const q = query(collection(db, 'players'), where('level', '>=', 1));
  return onSnapshot(
    q,
    (snap) => {
      const nowMs = Date.now();
      const list: OnlinePlayer[] = [];
      for (const d of snap.docs) {
        const data = d.data();
        const updatedMs = data.updatedAt?.toMillis ? data.updatedAt.toMillis() : nowMs;
        if (nowMs - updatedMs > 45000) continue;
        list.push({
          id: d.id,
          name: String(data.name || 'Siswa'),
          school: String(data.school || 'Sekolah'),
          className: String(data.className || '6'),
          shirtColor: String(data.shirtColor || '#2563EB'),
          pantsColor: '#1E293B',
          hairColor: '#1E1B18',
          hatStyle: 'default',
          companion: (data.companion as CompanionId) || 'garuda',
          x: Number(data.x || 0),
          y: Number(data.y || 0),
          z: Number(data.z || 34),
          rotY: Number(data.rotY || 0),
          moving: false,
          level: Number(data.level || 1),
          completedCount: Number(data.completedCount || 0),
          insideBuildingId: String(data.insideBuildingId || '')
        });
      }
      onPlayers(list);
    },
    () => {
      // Ignore transient snapshot errors
    }
  );
}

