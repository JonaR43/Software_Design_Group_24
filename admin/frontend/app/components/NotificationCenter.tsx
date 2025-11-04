import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { NotificationService, type Notification as APINotification } from '~/services/api';

interface Notification {
  id: string;
  type: 'assignment' | 'event-assignment' | 'event-update' | 'reminder' | 'cancellation' | 'system' | 'matching-suggestion';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications from backend
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const apiNotifications = await NotificationService.getNotifications({ limit: 20 });

        console.log('Raw API notifications:', apiNotifications);

        // Transform API notifications to component format
        const transformedNotifications: Notification[] = apiNotifications.map(notif => {
          console.log('Transforming notification:', notif);
          return {
            id: notif.id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            timestamp: new Date(notif.createdAt),
            read: notif.read,
            actionUrl: notif.actionUrl
          };
        });

        console.log('Transformed notifications:', transformedNotifications);
        setNotifications(transformedNotifications);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();

    // Refresh notifications every 3 seconds for instant updates
    const interval = setInterval(loadNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  // Reload notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const loadNotifications = async () => {
        try {
          const apiNotifications = await NotificationService.getNotifications({ limit: 20 });
          const transformedNotifications: Notification[] = apiNotifications.map(notif => ({
            id: notif.id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            timestamp: new Date(notif.createdAt),
            read: notif.read,
            actionUrl: notif.actionUrl
          }));
          setNotifications(transformedNotifications);
        } catch (error) {
          console.error('Failed to load notifications:', error);
        }
      };
      loadNotifications();
    }
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 400; // Approximate dropdown height
      
      // Calculate if dropdown would go below viewport
      let top = rect.bottom + 8;
      if (top + dropdownHeight > viewportHeight) {
        // Position above the button if it would overflow
        top = rect.top - dropdownHeight - 8;
      }
      
      const newPosition = {
        top: Math.max(8, top), // Ensure it's at least 8px from top
        left: 256 + 16 // Position dropdown to the right of sidebar (256px sidebar width + 16px margin)
      };
      console.log('Button rect:', rect, 'New position:', newPosition, 'Viewport height:', viewportHeight);
      setDropdownPosition(newPosition);
    }
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      console.log('Marking all notifications as read...');
      await NotificationService.markAllAsRead();
      console.log('Successfully marked all as read on backend');

      // Update local state immediately
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );

      // Force reload notifications to sync with backend
      const apiNotifications = await NotificationService.getNotifications({ limit: 20 });
      const transformedNotifications: Notification[] = apiNotifications.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        timestamp: new Date(notif.createdAt),
        read: notif.read,
        actionUrl: notif.actionUrl
      }));
      setNotifications(transformedNotifications);
      console.log('Notifications reloaded after mark all as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    if (notification.actionUrl) {
      setIsOpen(false); // Close the dropdown
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'assignment':
      case 'event-assignment':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'event-update':
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'reminder':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'cancellation':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'matching-suggestion':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 16l-4-4h8l-4 4z" />
          </svg>
        );
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 17h5l-5 5v-5zM11 16l-4-4h8l-4 4z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown - Rendered via Portal */}
      {isOpen && createPortal(
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="fixed w-96 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden"
               style={{
                 top: `${dropdownPosition.top}px`,
                 left: `${dropdownPosition.left}px`,
                 maxHeight: `${Math.min(500, window.innerHeight - dropdownPosition.top - 20)}px`,
                 zIndex: 9999,
                 backgroundColor: 'white',
                 boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                 position: 'fixed'
               }}>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 relative" style={{ zIndex: 10000 }}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleMarkAllAsRead();
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors cursor-pointer relative z-50"
                      style={{ pointerEvents: 'auto' }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: '300px' }}>
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-slate-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                            d="M15 17h5l-5 5v-5zM11 16l-4-4h8l-4 4z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/dashboard/notifications');
                  }}
                  className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}