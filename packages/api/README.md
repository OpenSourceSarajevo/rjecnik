# @rjecnik/api

Typed client for the Rječnik API (`apps/api`), shared by `apps/web` and `apps/admin`. It has no dependencies and doesn't know which framework or HTTP library is used.

- `types.ts` — request and response shapes, mirroring the FastAPI models
- `endpoints/` — one file per resource (`words`, `dashboard`, `ignoredWords`, `newWords`), combined by `createApi(transport)` in `endpoints/index.ts`: one typed function per endpoint (`api.words.search(...)`, `api.newWords.applyNewForm(...)`, …)
- `transport.ts` — the `Transport` interface, `ApiError`, and the default `fetch` transport

## Usage

```ts
import { createApi, createFetchTransport } from '@rjecnik/api';

export const api = createApi(
  createFetchTransport({ baseUrl: 'http://localhost:8000', getToken: async () => token })
);

const { items, has_more } = await api.words.search({ q: 'kuć', page_size: 5 });
```

Every endpoint takes the transport's per-call options as its last argument. With the fetch transport that's a `RequestInit`, e.g. `{ signal }` or, in Next.js, `{ next: { revalidate: 3600 } }`.

## Another HTTP library

A transport turns an `ApiRequest` (`method`, `path`, `query`, `body`) into the parsed response and throws `ApiError` on failure. For example, with axios (installed in the app, since this package has no dependencies):

```ts
import axios, { type AxiosRequestConfig } from 'axios';
import { createApi, toApiError, type Transport } from '@rjecnik/api';

const client = axios.create({ baseURL: 'http://localhost:8000' });

const axiosTransport: Transport<AxiosRequestConfig> = async (req, config) => {
  try {
    const res = await client.request({
      ...config,
      method: req.method,
      url: req.path,
      params: req.query,
      data: req.body,
    });
    return res.data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) throw toApiError(e.response.status, e.response.data);
    throw e;
  }
};

export const api = createApi(axiosTransport); // api.words.search(params, { timeout: 5000 })
```

## React Query (or SWR, …)

These libraries handle caching and state, not HTTP, so they sit on top of the endpoint functions:

```ts
const { data } = useQuery({
  queryKey: ['words', 'search', params],
  queryFn: ({ signal }) => api.words.search(params, { signal }),
});

const save = useMutation({ mutationFn: (body: WordInput) => api.words.update(id, body) });
```
