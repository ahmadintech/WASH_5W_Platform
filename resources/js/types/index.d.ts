import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role?: string;
    organisation_id?: number;
}

export type UserRole = 'admin' | 'coordinator' | 'partner';

export interface PageProps<T extends Record<string, unknown> = Record<string, unknown>> {
    auth: {
        user: User;
        permissions: string[];
        roles: string[];
    };
    ziggy: Config & { location: string };
    flash: {
        success?: string;
        error?: string;
        warning?: string;
    };
    [key: string]: unknown;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}
