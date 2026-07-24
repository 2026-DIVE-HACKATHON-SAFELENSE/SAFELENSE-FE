/**
 * 알림(notifications) API — `/api/v1/notifications` (OpenAPI 계약 기준).
 */
import { api } from '@/api/client';

export type NotificationType = 'ANALYSIS' | 'NEWS' | 'SYSTEM';

/** NotificationResponse. */
export type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  /** ISO date-time. */
  createdAt: string;
  targetType?: 'ANALYSIS_RESULT' | 'NEWS_ARTICLE' | null;
  targetId?: string | null;
};

/** NotificationListResponse. */
export type NotificationList = {
  notifications: NotificationItem[];
  /** 페이지와 무관한 전체 미읽음 개수. */
  unreadCount: number;
  nextCursor?: number | null;
  hasNext: boolean;
};

/** 알림 목록 (첫 페이지). */
export function listNotifications(): Promise<NotificationList> {
  return api.get<NotificationList>('/api/v1/notifications');
}

/** 한 건 읽음 처리. */
export function markNotificationRead(id: number): Promise<void> {
  return api.patch<void>(`/api/v1/notifications/${id}/read`);
}

/** 모두 읽음 처리. */
export function markAllNotificationsRead(): Promise<void> {
  return api.patch<void>('/api/v1/notifications/read-all');
}
