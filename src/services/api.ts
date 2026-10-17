import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'experience-connect.auth-token';
const REQUEST_TIMEOUT_MS = 12000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  authenticated?: boolean;
};

function apiBaseUrl(): string {
  const value = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (!value) {
    throw new ApiError(
      'Set EXPO_PUBLIC_API_URL to the Laravel API address before using the app.',
      0,
    );
  }
  return value;
}

export async function readAuthToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveAuthToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') {
      throw new Error('Browser storage is unavailable.');
    }
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${apiBaseUrl()}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  try {
    if (options.authenticated !== false) {
      const token = await readAuthToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });
    } catch (error) {
      const timedOut = error instanceof Error && error.name === 'AbortError';
      throw new ApiError(
        timedOut
          ? 'The server took too long to respond. Please try again.'
          : 'Could not reach the server. Check your connection and API address.',
        0,
      );
    }

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401) await clearAuthToken();
      const body = payload as { message?: string; errors?: Record<string, string[]> } | null;
      throw new ApiError(
        body?.message ?? `The request failed with status ${response.status}.`,
        response.status,
        body?.errors,
      );
    }

    return payload as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const firstFieldError = Object.values(error.errors ?? {})[0]?.[0];
    return firstFieldError ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred. Please try again.';
}
