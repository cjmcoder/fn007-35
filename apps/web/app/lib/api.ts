export async function postJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, { 
    method: 'POST', 
    headers: { 'Content-Type':'application/json' }, 
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!r.ok) {
    const errorText = await r.text();
    throw new Error(errorText || `Request failed: ${r.status}`);
  }
  return r.json() as Promise<T>;
}

export async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, {
    credentials: 'include',
  });
  if (!r.ok) {
    const errorText = await r.text();
    throw new Error(errorText || `Request failed: ${r.status}`);
  }
  return r.json() as Promise<T>;
}

export async function getTrustMe(): Promise<{ score:number; effects:string[] }> {
  return getJSON('/api/trust/me');
}
