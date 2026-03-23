import type { User } from '@stores/authStore';

/**
 * True when the user is authenticated but must finish mandatory onboarding.
 * Aligns with backend `pin_enabled` on profile/login (see BACKEND_AUTH_RECOMMENDATIONS.md).
 *
 * - Missing username → choose username.
 * - `pin_enabled === false` (explicit from API) → complete PIN setup.
 * - `pin_enabled` undefined → treat as already configured (legacy clients / old payloads).
 */
export function needsAuthOnboarding(user: User | null | undefined): boolean {
    if (!user) return false;
    if (!user.username?.trim()) return true;
    if (user.pin_enabled === false) return true;
    return false;
}
