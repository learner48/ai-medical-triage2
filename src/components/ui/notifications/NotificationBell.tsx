import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../button';
import { notificationService, type Notification } from '../../../lib/notifications';
import { useAuthStore } from '../../../store/auth';

export function NotificationBell() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load initial unread notifications
    loadUnreadNotifications();

    // Subscribe to new notifications
    const subscription = notificationService.subscribeToNotifications(
      user.id,
      (notification) => {
        setNotifications(prev => [notification, ...prev]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadUnreadNotifications = async () => {
    if (!user) return;
    try {
      const unread = await notificationService.getUnreadNotifications(user.id);
      setNotifications(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-semantic-critical text-white text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <p className="text-sm text-gray-900">{notification.message_content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}