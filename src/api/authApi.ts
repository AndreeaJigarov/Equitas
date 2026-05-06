const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/api/auth`;

export interface AuthUser {
    id: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
}

export interface LoginPayload {
    username: string;
    password: string;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
}

async function parseError(res: Response): Promise<string> {
    try {
        const body = await res.json();
        if (body && typeof body === 'object') {
            // Backend returns { error: "..." } for auth failures and
            // { fieldName: "..." } for validation errors.
            const firstValue = Object.values(body).find(v => typeof v === 'string') as string | undefined;
            if (firstValue) return firstValue;
        }
    } catch {
        /* fall through */
    }
    return res.statusText || 'Request failed';
}

function normalize(raw: any): AuthUser {
    return {
        id: raw.id,
        username: raw.username,
        email: raw.email,
        roles: Array.isArray(raw.roles) ? raw.roles : [],
        permissions: Array.isArray(raw.permissions) ? raw.permissions : [],
    };
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return normalize(await res.json());
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
    const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return normalize(await res.json());
}
