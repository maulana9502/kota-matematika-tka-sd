import { getCachedGoogleAccessToken } from './firebaseClient';

export const DEFAULT_TEACHER_EMAIL = 'GANTI_DENGAN_EMAIL_GURU@gmail.com';

interface DriveSearchResponse {
  files?: { id: string; name: string }[];
}

interface SheetMetadataResponse {
  sheets?: { properties?: { title?: string } }[];
}

async function driveFetch<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google API Error (${res.status}): ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

async function findOrCreateFolder(name: string, parentId: string | undefined, token: string): Promise<string> {
  const safeName = name.replace(/'/g, "\\'");
  const parentClause = parentId ? ` and '${parentId}' in parents` : ` and 'root' in parents`;
  const q = encodeURIComponent(
    `name='${safeName}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentClause}`
  );
  const found = await driveFetch<DriveSearchResponse>(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
    token
  );
  if (found.files && found.files.length > 0) {
    return found.files[0].id;
  }

  const created = await driveFetch<{ id: string }>('https://www.googleapis.com/drive/v3/files', token, {
    method: 'POST',
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId ? { parents: [parentId] } : {})
    })
  });
  return created.id;
}

async function shareFileWithTeacher(fileId: string, teacherEmail: string, token: string) {
  const trimmed = teacherEmail.trim();
  if (!trimmed || trimmed.includes('GANTI_DENGAN_EMAIL_GURU') || !trimmed.includes('@')) {
    return;
  }
  try {
    await driveFetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?sendNotificationEmail=false`, token, {
      method: 'POST',
      body: JSON.stringify({
        type: 'user',
        role: 'reader',
        emailAddress: trimmed
      })
    });
  } catch {
    // Non-fatal if teacher email cannot be shared directly
  }
}

async function findOrCreateSpreadsheet(
  title: string,
  folderId: string,
  token: string
): Promise<{ spreadsheetId: string; isNew: boolean }> {
  const safeTitle = title.replace(/'/g, "\\'");
  const q = encodeURIComponent(
    `name='${safeTitle}' and mimeType='application/vnd.google-apps.spreadsheet' and '${folderId}' in parents and trashed=false`
  );
  const found = await driveFetch<DriveSearchResponse>(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
    token
  );
  if (found.files && found.files.length > 0) {
    return { spreadsheetId: found.files[0].id, isNew: false };
  }

  const created = await driveFetch<{ id: string }>('https://www.googleapis.com/drive/v3/files', token, {
    method: 'POST',
    body: JSON.stringify({
      name: title,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [folderId]
    })
  });
  return { spreadsheetId: created.id, isNew: true };
}

export async function syncEntryToGoogleSheets(params: {
  studentName: string;
  school: string;
  className: string;
  chapterTitle: string;
  questionLabel: string;
  pgScore: number;
  reflectionText: string;
  teacherEmail?: string;
}): Promise<{ ok: boolean; spreadsheetUrl?: string; message: string }> {
  const token = getCachedGoogleAccessToken();
  if (!token) {
    return {
      ok: false,
      message: 'Masuk dengan Google terlebih dahulu agar bisa sinkron otomatis ke Google Drive & Google Sheets.'
    };
  }

  try {
    // Hierarchy: Kota Matematika TKA -> Sekolah -> Kelas -> Nama Siswa -> Spreadsheet Bab
    const rootFolder = await findOrCreateFolder('Kota Matematika TKA', undefined, token);
    const schoolFolder = await findOrCreateFolder(params.school || 'Sekolah', rootFolder, token);
    const classFolder = await findOrCreateFolder(`Kelas ${params.className || '6'}`, schoolFolder, token);
    const studentFolder = await findOrCreateFolder(params.studentName || 'Siswa', classFolder, token);

    const sheetFileTitle = `Arsip ${params.chapterTitle}`;
    const { spreadsheetId, isNew } = await findOrCreateSpreadsheet(sheetFileTitle, studentFolder, token);

    // Fetch actual first sheet tab title dynamically (never hardcode 'Sheet1')
    const meta = await driveFetch<SheetMetadataResponse>(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
      token
    );
    const firstTab = meta.sheets?.[0]?.properties?.title || 'Sheet1';

    if (isNew) {
      const headerRange = encodeURIComponent(`${firstTab}!A1:H1`);
      await driveFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${headerRange}:append?valueInputOption=USER_ENTERED`,
        token,
        {
          method: 'POST',
          body: JSON.stringify({
            values: [['Waktu', 'Nama Siswa', 'Asal Sekolah', 'Kelas', 'Bab', 'Soal / Aktivitas', 'Skor PG', 'Jawaban / Refleksi']]
          })
        }
      );
      if (params.teacherEmail) {
        await shareFileWithTeacher(spreadsheetId, params.teacherEmail, token);
      }
    }

    const rowRange = encodeURIComponent(`${firstTab}!A:H`);
    await driveFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rowRange}:append?valueInputOption=USER_ENTERED`,
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          values: [[
            new Date().toLocaleString('id-ID'),
            params.studentName,
            params.school,
            params.className,
            params.chapterTitle,
            params.questionLabel,
            params.pgScore,
            params.reflectionText || '-'
          ]]
        })
      }
    );

    return {
      ok: true,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      message: 'Berhasil dikirim ke Google Drive & Google Sheets!'
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Gagal menghubungi Google Drive/Sheets.'
    };
  }
}
