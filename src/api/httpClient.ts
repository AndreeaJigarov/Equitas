import { useAuthStore } from '../store/useAuthStore';

/**
 * Thin fetch wrapper that injects the current user's identity headers so
 * the backend AuditInterceptor can attribute every request. No tokens —
 * Silver/Gold spec doesn't require auth, just persistence + traceability.
 */
export async function authedFetch(
    input: RequestInfo | URL,
    init: RequestInit = {},
): Promise<Response> {
    const user = useAuthStore.getState().user;

    const headers = new Headers(init.headers || {});
    if (user) {
        headers.set('X-User-Id', user.id);
        headers.set('X-Username', user.username);
        headers.set('X-User-Role', user.roles.includes('ADMIN') ? 'ADMIN' : 'USER');
    }
    if (init.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    return fetch(input, { ...init, headers });
}
