function base64UrlEncode(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem) {
  const base64 = pem.replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0)).buffer;
}

async function serviceAccountToken(env) {
  if (!env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    throw new Error('server_missing_firebase_service_account');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64UrlEncode(JSON.stringify({
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));
  const unsigned = `${header}.${claim}`;
  const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${base64UrlEncode(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error('firebase_service_token_failed');
  const body = await res.json();
  return body.access_token;
}

function firestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } };
  if (typeof value === 'object') {
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, val]) => [key, firestoreValue(val)])) } };
  }
  return { stringValue: String(value) };
}

function fromFirestoreValue(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return Date.parse(value.timestampValue);
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ('mapValue' in value) {
    return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, val]) => [key, fromFirestoreValue(val)]));
  }
  return undefined;
}

export function toFirestoreDocument(data) {
  return {
    fields: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, firestoreValue(value)])),
  };
}

export function fromFirestoreDocument(doc) {
  if (!doc?.fields) return null;
  return Object.fromEntries(Object.entries(doc.fields).map(([key, value]) => [key, fromFirestoreValue(value)]));
}

async function firestoreFetch(env, path, init = {}) {
  const token = await serviceAccountToken(env);
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`firestore_error:${res.status}:${text.slice(0, 240)}`);
  }
  return res.json();
}

function databaseRoot(env) {
  return `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
}

export function docName(env, path) {
  return `${databaseRoot(env)}/${path}`;
}

export async function getDoc(env, path) {
  const doc = await firestoreFetch(env, path);
  return fromFirestoreDocument(doc);
}

export async function patchDoc(env, path, data, updateMaskFields = Object.keys(data)) {
  const mask = updateMaskFields.map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`).join('&');
  const suffix = mask ? `?${mask}` : '';
  const doc = await firestoreFetch(env, `${path}${suffix}`, {
    method: 'PATCH',
    body: JSON.stringify(toFirestoreDocument(data)),
  });
  return fromFirestoreDocument(doc);
}

export async function createDoc(env, collectionPath, docId, data) {
  const doc = await firestoreFetch(env, `${collectionPath}?documentId=${encodeURIComponent(docId)}`, {
    method: 'POST',
    body: JSON.stringify(toFirestoreDocument(data)),
  });
  return fromFirestoreDocument(doc);
}

export async function commitWrites(env, writes) {
  const token = await serviceAccountToken(env);
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:commit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ writes }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`firestore_commit_error:${res.status}:${text.slice(0, 240)}`);
  }
  return res.json();
}

export async function beginTransaction(env) {
  const token = await serviceAccountToken(env);
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:beginTransaction`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ options: { readWrite: {} } }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`firestore_begin_transaction_error:${res.status}:${text.slice(0, 240)}`);
  }
  const body = await res.json();
  return body.transaction;
}

export async function batchGetDocs(env, paths, transaction) {
  const token = await serviceAccountToken(env);
  const body = {
    documents: paths.map((path) => docName(env, path)),
    ...(transaction ? { transaction } : {}),
  };
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:batchGet`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`firestore_batch_get_error:${res.status}:${text.slice(0, 240)}`);
  }
  const rows = await res.json();
  const docs = new Map();
  for (const row of rows) {
    const found = row.found;
    if (found?.name) {
      docs.set(found.name.replace(`${databaseRoot(env)}/`, ''), fromFirestoreDocument(found));
    } else if (row.missing) {
      docs.set(row.missing.replace(`${databaseRoot(env)}/`, ''), null);
    }
  }
  return docs;
}

export async function commitTransaction(env, transaction, writes) {
  const token = await serviceAccountToken(env);
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:commit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transaction, writes }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`firestore_transaction_commit_error:${res.status}:${text.slice(0, 240)}`);
  }
  return res.json();
}

export function updateWrite(env, path, data, updateMaskFields = Object.keys(data)) {
  return {
    update: {
      name: `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`,
      ...toFirestoreDocument(data),
    },
    updateMask: { fieldPaths: updateMaskFields },
  };
}

export function createWrite(env, path, data) {
  return {
    update: {
      name: `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`,
      ...toFirestoreDocument(data),
    },
    currentDocument: { exists: false },
  };
}

export function setWrite(env, path, data) {
  return {
    update: {
      name: `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`,
      ...toFirestoreDocument(data),
    },
  };
}
