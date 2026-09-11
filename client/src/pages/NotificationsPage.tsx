import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Bell, CheckCheck, Check, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Alerts on assigned tasks, status changes, and overdue deadlines
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead()} className="gap-2">
            <CheckCheck className="h-4 w-4 text-indigo-600" />
            <span>Mark All as Read</span>
          </Button>
        )}
      </div>

      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <LoadingSpinner className="py-24" />
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">You have no notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                    !n.isRead ? 'bg-indigo-50/30' : 'hover:bg-gray-50/80'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">{n.title}</h4>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 inline-block" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                    <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })} &bull;{' '}
                      {format(new Date(n.createdAt), 'MMM dd, yyyy h:mm a')}
                    </p>
                  </div>

                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markRead(n.id)}
                      className="text-xs text-indigo-600"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Mark read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
