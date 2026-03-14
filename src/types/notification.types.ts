export interface Notification {
    id: string;
    user_id: string;
    category: string;
    title: string;
    body: string;
    read: boolean;
    metadata: string;
    created_at: string;
}

export interface NotificationListResponse {
    notifications: Notification[];
    pagination: { total: number; page: number; limit: number; has_more: boolean };
    unread_count: number;
}
