import { useState, useEffect, useContext } from 'react';
import { notificationService } from '../../api/notificationService';
import { Bell, Check, Circle, ExternalLink, Calendar, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SocketContext } from '../../context/SocketContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    fetchNotifications();
    
    if (socket) {
      const handleNewNotification = (notification) => {
        if (filter === 'all' || (filter === 'unread' && !notification.isRead)) {
          setNotifications(prev => [notification, ...prev]);
        }
      };
      
      socket.on('new_notification', handleNewNotification);
      
      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [filter, socket]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter === 'unread') {
        params.isRead = false;
      }
      const res = await notificationService.getNotifications(params);
      setNotifications(res.data);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      if (filter === 'unread') {
        setNotifications(notifications.filter(n => n._id !== id));
      } else {
        setNotifications(notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        ));
      }
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      if (filter === 'unread') {
        setNotifications([]);
      } else {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Stay updated on your case activities.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
          </select>
          
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
            <Bell className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">You're all caught up!</h3>
            <p>No new notifications to display right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map(notif => (
              <div 
                key={notif._id} 
                className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${notif.isRead ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80' : 'bg-indigo-50/30 dark:bg-indigo-900/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20'}`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1 flex-shrink-0">
                    {!notif.isRead ? (
                      <Circle className="h-4 w-4 fill-indigo-600 text-indigo-600" />
                    ) : (
                      <Check className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-lg mb-1 ${notif.isRead ? 'font-semibold text-gray-700 dark:text-gray-300' : 'font-bold text-gray-900 dark:text-white'}`}>
                      {notif.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                      </div>
                      {notif.sender && (
                        <div className="flex items-center text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                          From: {notif.sender.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex sm:flex-col justify-end gap-3 sm:gap-2 ml-8 sm:ml-0">
                  {notif.link && (
                    <Link 
                      to={notif.link}
                      onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                      className="inline-flex items-center justify-center px-4 py-2 sm:px-3 sm:py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition shadow-sm"
                    >
                      View Details
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  )}
                  {!notif.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="inline-flex items-center justify-center px-4 py-2 sm:px-3 sm:py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
};

export default NotificationsList;
