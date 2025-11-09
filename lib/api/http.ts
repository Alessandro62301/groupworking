type HttpMethod = 'GET' | 'POST' | 'PATCH';

export type ApiError = Error & {
  status?: number;
  data?: unknown;
};

export async function postJson<T = any>(url: string, body: unknown, opts?: RequestInit): Promise<T> {
  return handleRequest<T>(url, 'POST', body, opts);
}

export async function getJson<T = any>(url: string, opts?: RequestInit): Promise<T> {
  return handleRequest<T>(url, 'GET', undefined, opts);
}

export async function patchJson<T = any>(url: string, body: unknown, opts?: RequestInit): Promise<T> {
  return handleRequest<T>(url, 'PATCH', body, opts);
}

async function handleRequest<T>(url: string, method: HttpMethod, body?: unknown, opts?: RequestInit) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
    ...opts,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data?.message || `Erro HTTP ${res.status}`) as ApiError;
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}
