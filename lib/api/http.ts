export async function postJson<T = any>(url: string, body: unknown, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) },
    body: JSON.stringify(body),
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `Erro HTTP ${res.status}`);
  }
  return data as T;
}
