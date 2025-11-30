export function authHeaders(userId?: string, jwt?: string) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (jwt) h.Authorization = `Bearer ${jwt}`;
  if (!jwt && userId) h['x-user-id'] = userId; // dev bypass
  return h;
}

export async function postJSON<T>(url: string, body: any, headers: Record<string,string>) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: ctrl.signal,
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } finally { clearTimeout(to); }
}

// Re-export APIs from api-client to fix import errors
export { 
  matchApi, 
  userApi, 
  walletApi, 
  authApi,
  propsApi,
  realtimeConnection,
  REALTIME_EVENTS,
  type RealtimeEvent,
  API_BASE_URL,
  GAMING_API_URL
} from './api-client';