const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/**
 * Calls the public endpoints of the Rječnik API (apps/api). Works both on the
 * server and in the browser; pass `next.revalidate` for cached server fetches.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, init);
  if (!res.ok) {
    throw new ApiError(res.status, `Greška: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
