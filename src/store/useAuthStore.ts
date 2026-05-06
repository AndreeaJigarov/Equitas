import { create } from 'zustand';
import * as authApi from '../api/authApi';
import type { AuthUser, LoginPayload, RegisterPayload } from '../api/authApi';

const STORAGE_KEY = 'equitas.auth.user';

function loadFromStorage(): AuthUser | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
        return null;
    }
}

function persist(user: AuthUser | null) {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
}

interface AuthStore {
    user: AuthUser | null;
    isLoading: boolean;
    error: string | null;

    login: (payload: LoginPayload) => Promise<AuthUser>;
    register: (payload: RegisterPayload) => Promise<AuthUser>;
    logout: () => void;

    hasRole: (role: string) => boolean;
    hasPermission: (permission: string) => boolean;
    isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: loadFromStorage(),
    isLoading: false,
    error: null,

    login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            const user = await authApi.login(payload);
            persist(user);
            set({ user, isLoading: false });
            return user;
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Login failed';
            set({ isLoading: false, error: msg });
            throw e;
        }
    },

    register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            const user = await authApi.register(payload);
            persist(user);
            set({ user, isLoading: false });
            return user;
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Registration failed';
            set({ isLoading: false, error: msg });
            throw e;
        }
    },

    logout: () => {
        persist(null);
        set({ user: null, error: null });
    },

    hasRole: (role) => {
        const u = get().user;
        return !!u && u.roles.includes(role);
    },
    hasPermission: (permission) => {
        const u = get().user;
        return !!u && u.permissions.includes(permission);
    },
    isAdmin: () => {
        const u = get().user;
        return !!u && u.roles.includes('ADMIN');
    },
}));
