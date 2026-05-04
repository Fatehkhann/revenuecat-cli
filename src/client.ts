import fetch, { Response } from 'node-fetch';
import { getApiKey } from './config';

const BASE_URL = 'https://api.revenuecat.com/v2';

export class ApiError extends Error {
  constructor(
    public status: number,
    public type: string,
    message: string,
    public retryable: boolean,
    public docUrl?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse(res: Response): Promise<any> {
  if (res.status === 204) return { deleted: true };

  const body = await res.text();
  let data: any;
  try {
    data = JSON.parse(body);
  } catch {
    data = body;
  }

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    const type = data?.type || 'unknown_error';
    const retryable = data?.retryable || false;
    const docUrl = data?.doc_url;

    // Add specific error handling for known RevenueCat API error types
    if (type === 'app_not_found' || type === 'invalid_app_id') {
      throw new ApiError(res.status, type, `App not found. Please check your App ID. ${docUrl ? `See: ${docUrl}` : ''}`, retryable, docUrl);
    } else if (type === 'unauthorized' || type === 'invalid_api_key') {
      throw new ApiError(res.status, type, `Invalid API key or insufficient permissions. Please check your API key. ${docUrl ? `See: ${docUrl}` : ''}`, retryable, docUrl);
    } else if (type === 'rate_limited') {
      throw new ApiError(res.status, type, `Rate limit exceeded. Please wait a moment before retrying. ${docUrl ? `See: ${docUrl}` : ''}`, retryable, docUrl);
    } else if (type === 'invalid_query_params' || type.startsWith('validation_error')) {
      throw new ApiError(res.status, type, `Invalid query parameters or malformed request. ${docUrl ? `See: ${docUrl}` : ''}`, retryable, docUrl);
    } else if (type === 'internal_server_error') {
      throw new ApiError(res.status, type, `RevenueCat API encountered an internal error. Please try again later. ${docUrl ? `See: ${docUrl}` : ''}`, retryable, docUrl);
    }

    // Default error handling for unknown or unhandled types
    throw new ApiError(res.status, type, `${msg} ${docUrl ? `See: ${docUrl}` : ''}`, retryable, docUrl);
  }

  return data;
}

function headers(): Record<string, string> {
  const key = getApiKey();
  if (!key) {
    throw new Error(
      'No API key configured. Run: rcat configure --api-key <key>\n' +
        'Or set RCAT_API_KEY environment variable.',
    );
  }
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export async function get(path: string, query?: Record<string, string>): Promise<any> {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString(), { method: 'GET', headers: headers() });
  return handleResponse(res);
}

export async function post(path: string, body?: any): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(res);
}

export async function patch(path: string, body?: any): Promise<any> { // Added PATCH support
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(res);
}

export async function del(path: string): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: headers(),
  });
  return handleResponse(res);
}

export async function paginate(
  path: string,
  query?: Record<string, string>,
  limit?: number,
  perPageLimit: number = 100, // New parameter for per-page limit
  cursorKey: string = 'id', // New parameter for configurable cursor key
): Promise<any[]> {
  const all: any[] = [];
  let cursor: string | undefined;
  // Cap perPage at a reasonable maximum, e.g., 1000, or the provided limit if smaller
  const actualPerPage = Math.min(limit && limit < perPageLimit ? limit : perPageLimit, 1000).toString();

  while (true) {
    const q: Record<string, string> = { ...query, limit: actualPerPage };
    if (cursor) q.starting_after = cursor;

    const data = await get(path, q);
    // Ensure data.items exists before proceeding
    const items = Array.isArray(data?.items) ? data.items : [];
    all.push(...items);

    if (limit && all.length >= limit) return all.slice(0, limit);
    // Check if there's a next page and if items were returned
    if (!data.next_page || items.length === 0) break;

    const lastItem = items[items.length - 1];
    // Use configurable cursorKey, defaulting to 'id'
    cursor = lastItem?.[cursorKey];
    if (!cursor) break; // If no cursor, cannot paginate further
  }

  return all;
}
