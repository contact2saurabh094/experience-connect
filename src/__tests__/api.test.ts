import * as SecureStore from 'expo-secure-store';
import { ApiError, apiRequest } from '../services/api';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('saved-token'),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const secureStore = jest.mocked(SecureStore);
const fetchMock: jest.MockedFunction<typeof fetch> = jest.fn();

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('API client', () => {
  const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://127.0.0.1:8000/api';
    secureStore.getItemAsync.mockResolvedValue('saved-token');
    secureStore.setItemAsync.mockResolvedValue(undefined);
    secureStore.deleteItemAsync.mockResolvedValue(undefined);
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  afterAll(() => {
    if (originalApiUrl === undefined) delete process.env.EXPO_PUBLIC_API_URL;
    else process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
  });

  it('sends JSON and includes a saved bearer token', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { id: '7' } }));

    await expect(apiRequest('/me')).resolves.toEqual({ data: { id: '7' } });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/me',
      expect.objectContaining({
        method: 'GET',
        headers: { Accept: 'application/json', Authorization: 'Bearer saved-token' },
      }),
    );
  });

  it('surfaces field validation errors from the API', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      message: 'The given data was invalid.',
      errors: { email: ['The email has already been taken.'] },
    }, 422));

    await expect(apiRequest('/auth/register', {
      method: 'POST',
      body: { email: 'duplicate@example.com' },
    })).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      errors: { email: ['The email has already been taken.'] },
    });
  });

  it('clears a revoked token and reports an expired session', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Unauthenticated.' }, 401));

    await expect(apiRequest('/me')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
    });
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith('experience-connect.auth-token');
  });

  it('reports network failures and missing API configuration explicitly', async () => {
    fetchMock.mockRejectedValue(new TypeError('offline'));
    await expect(apiRequest('/mentors')).rejects.toThrow('Could not reach the server');

    process.env.EXPO_PUBLIC_API_URL = '';
    await expect(apiRequest('/mentors')).rejects.toEqual(expect.objectContaining({
      message: 'Set EXPO_PUBLIC_API_URL to the Laravel API address before using the app.',
    }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not silently shape HTTP errors as successful data', async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, 503));

    try {
      await apiRequest('/bookings');
      throw new Error('Expected the request to fail.');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(503);
      expect((error as ApiError).message).toContain('503');
    }
  });
});
