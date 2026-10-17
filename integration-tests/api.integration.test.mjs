import assert from 'node:assert/strict';
import test from 'node:test';

const baseUrl = new URL(
  process.env.API_INTEGRATION_BASE_URL ?? 'http://127.0.0.1:8000/api',
);

if (!['localhost', '127.0.0.1', '[::1]'].includes(baseUrl.hostname)) {
  throw new Error('Integration tests may only run against a local API host.');
}

const email = process.env.API_INTEGRATION_EMAIL ?? 'learner@example.com';
const password = process.env.API_INTEGRATION_PASSWORD ?? 'demo12345';
const requestTimeout = AbortSignal.timeout(12000);

test('local Laravel API authenticates, serves data, and revokes the token', async () => {
  let token;

  try {
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: requestTimeout,
    });
    assert.equal(loginResponse.status, 200, 'demo login succeeds');
    const login = await loginResponse.json();
    assert.equal(typeof login.data.token, 'string');
    token = login.data.token;

    const authorization = { Authorization: `Bearer ${token}` };
    const profileResponse = await fetch(`${baseUrl}/me`, {
      headers: { ...authorization, Accept: 'application/json' },
      signal: requestTimeout,
    });
    assert.equal(profileResponse.status, 200, 'authenticated profile is accessible');
    assert.equal((await profileResponse.json()).data.email, email);

    const mentorResponse = await fetch(`${baseUrl}/mentors?per_page=2`, {
      headers: { Accept: 'application/json' },
      signal: requestTimeout,
    });
    assert.equal(mentorResponse.status, 200, 'public mentor search succeeds');
    const mentors = await mentorResponse.json();
    assert.ok(mentors.data.length > 0 && mentors.data.length <= 2);
    assert.equal(typeof mentors.meta.current_page, 'number');

    const logoutResponse = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { ...authorization, Accept: 'application/json' },
      signal: requestTimeout,
    });
    assert.equal(logoutResponse.status, 200, 'logout revokes the token');
    token = undefined;

    const expiredResponse = await fetch(`${baseUrl}/me`, { signal: requestTimeout });
    assert.equal(expiredResponse.status, 401, 'revoked token is rejected without an Accept header');
    assert.match(expiredResponse.headers.get('content-type') ?? '', /application\/json/);
  } finally {
    if (token) {
      const cleanup = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        signal: requestTimeout,
      });
      assert.equal(cleanup.status, 200, 'cleanup revokes the test token');
    }
  }
});
