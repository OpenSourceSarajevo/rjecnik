export type QueryValue = string | number | boolean | null | undefined;

/** One API call, described independently of the HTTP library that will send it. */
export type ApiRequest = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** Path including the `/api` prefix, with path segments already encoded. */
  path: string;
  /** Query parameters; `null`, `undefined` and `''` are left out. */
  query?: Record<string, QueryValue>;
  /** JSON request body. */
  body?: unknown;
};

/**
 * Sends an `ApiRequest` and resolves to the parsed JSON response (`undefined` for 204).
 * Must throw `ApiError` for non-2xx responses. `Options` are per-call options of the
 * underlying library (e.g. `RequestInit` for fetch, `AxiosRequestConfig` for axios).
 */
export type Transport<Options = unknown> = <T>(
  request: ApiRequest,
  options?: Options
) => Promise<T>;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/** Builds an `ApiError` from a FastAPI error body (`detail` is a string or a list of field errors). */
export function toApiError(status: number, body: unknown): ApiError {
  const detail = (body as { detail?: unknown } | null)?.detail;
  let message: string | undefined;
  if (typeof detail === 'string') {
    message = detail;
  } else if (Array.isArray(detail)) {
    message = detail
      .map((e: { loc?: unknown[]; msg?: string }) => `${e.loc?.slice(1).join('.')}: ${e.msg}`)
      .join('; ');
  }
  return new ApiError(status, message ?? `Greška: ${status}`);
}

/** Query string (with leading `?`, or empty) for `ApiRequest.query`. */
export function toQueryString(query: ApiRequest['query']): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined && value !== '') params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export type FetchTransportOptions = {
  /** Origin of the Rječnik API (apps/api), e.g. `http://localhost:8000`. */
  baseUrl: string;
  /** Returns the bearer token for authenticated requests, if any. */
  getToken?: () => Promise<string | null | undefined>;
  /** Fetch implementation to use; defaults to the global `fetch`. */
  fetch?: typeof fetch;
};

/**
 * Transport built on `fetch`. Per-call options are a `RequestInit` passed through
 * unchanged, so framework extensions (e.g. Next.js' `next: { revalidate }`) still work.
 */
export function createFetchTransport({
  baseUrl,
  getToken,
  fetch: fetchImpl = (...args) => fetch(...args),
}: FetchTransportOptions): Transport<RequestInit> {
  return async function send<T>(request: ApiRequest, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);

    const token = await getToken?.();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    let body: string | undefined;
    if (request.body !== undefined) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(request.body);
    }

    const url = `${baseUrl}${request.path}${toQueryString(request.query)}`;
    const res = await fetchImpl(url, { ...init, method: request.method, headers, body });

    if (!res.ok) {
      throw toApiError(res.status, await res.json().catch(() => null));
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  };
}
