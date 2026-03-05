import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────
interface NotificationState {
    unreadCount: number;
    pushToken: string | null;
}

interface NotificationActions {
    setUnreadCount(n: number): void;
    incrementUnread(): void;
    clearUnread(): void;
    setPushToken(token: string): void;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useNotificationStore = create<NotificationState & NotificationActions>(
    (set, get) => ({
        unreadCount: 0,
        pushToken: null,

        setUnreadCount: (n) => set({ unreadCount: n }),
        incrementUnread: () => set({ unreadCount: get().unreadCount + 1 }),
        clearUnread: () => set({ unreadCount: 0 }),
        setPushToken: (token) => set({ pushToken: token }),
    }),
);
