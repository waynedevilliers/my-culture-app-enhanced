import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import notificationService from '../../services/notificationService';
import {
  FaBell,
  FaEnvelope,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaCog,
  FaEye,
  FaTrash,
  FaFilter,
  FaBellSlash
} from 'react-icons/fa6';

const NotificationCenter = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    certificateEmails: true,
    applicationUpdates: true,
    systemNotifications: true,
    newsletterEmails: true,
    emailDeliveryReceipts: false
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' or 'preferences'
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // This would be implemented when backend provides notification endpoints
      // For now, we'll show a placeholder structure
      setNotifications([
        {
          id: 1,
          type: 'certificate_sent',
          title: 'Certificate sent successfully',
          message: 'Certificate "Music Achievement Award" was sent to 3 recipients',
          timestamp: new Date().toISOString(),
          read: false,
          status: 'success'
        },
        {
          id: 2,
          type: 'application_approved',
          title: 'Organization application approved',
          message: 'Your organization application has been approved',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true,
          status: 'info'
        }
      ]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const result = await notificationService.getNotificationPreferences();
      if (result.success) {
        setPreferences({ ...preferences, ...result.data });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const result = await notificationService.updateNotificationPreferences(newPreferences);
      if (result.success) {
        setPreferences(newPreferences);
        toast.success('Notification preferences updated');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
    toast.success('Notification deleted');
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') return notifications.filter(n => !n.read);
    if (filter === 'read') return notifications.filter(n => n.read);
    return notifications;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <FaBell className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Notification Center</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">{unreadCount} unread notifications</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Notifications {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'preferences'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaCog className="w-4 h-4 mr-2 inline" />
            Settings
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'notifications' ? (
            <div>
              {/* Filter Bar */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <FaFilter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="select select-bordered select-sm"
                  >
                    <option value="all">All notifications</option>
                    <option value="unread">Unread only</option>
                    <option value="read">Read only</option>
                  </select>
                </div>
              </div>

              {/* Notifications List */}
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <FaSpinner className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2">Loading notifications...</span>
                  </div>
                ) : getFilteredNotifications().length === 0 ? (
                  <div className="text-center py-8">
                    <FaBellSlash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {filter === 'unread' ? 'No unread notifications' : 'No notifications found'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getFilteredNotifications().map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          notification.read
                            ? 'border-gray-200 bg-gray-50'
                            : 'border-primary bg-primary/5'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-2 h-2 rounded-full ${
                                notification.status === 'success' ? 'bg-green-500' :
                                notification.status === 'error' ? 'bg-red-500' :
                                notification.status === 'warning' ? 'bg-yellow-500' :
                                'bg-blue-500'
                              }`} />
                              <h4 className="font-semibold text-gray-800">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="px-2 py-1 bg-primary text-white text-xs rounded">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-1 ml-4">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="btn btn-ghost btn-xs"
                                title="Mark as read"
                              >
                                <FaEye className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="btn btn-ghost btn-xs text-red-500"
                              title="Delete"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Preferences Tab */
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Notification Preferences</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-700">Certificate Email Notifications</span>
                    <p className="text-sm text-gray-600">Receive emails when certificates are sent or generated</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.certificateEmails}
                    onChange={(e) => {
                      const newPrefs = { ...preferences, certificateEmails: e.target.checked };
                      setPreferences(newPrefs);
                      updatePreferences(newPrefs);
                    }}
                    className="checkbox checkbox-primary"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-700">Application Updates</span>
                    <p className="text-sm text-gray-600">Get notified about organization application status changes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.applicationUpdates}
                    onChange={(e) => {
                      const newPrefs = { ...preferences, applicationUpdates: e.target.checked };
                      setPreferences(newPrefs);
                      updatePreferences(newPrefs);
                    }}
                    className="checkbox checkbox-primary"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-700">System Notifications</span>
                    <p className="text-sm text-gray-600">Important system updates and maintenance notices</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.systemNotifications}
                    onChange={(e) => {
                      const newPrefs = { ...preferences, systemNotifications: e.target.checked };
                      setPreferences(newPrefs);
                      updatePreferences(newPrefs);
                    }}
                    className="checkbox checkbox-primary"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-700">Newsletter Emails</span>
                    <p className="text-sm text-gray-600">Receive newsletters and community updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.newsletterEmails}
                    onChange={(e) => {
                      const newPrefs = { ...preferences, newsletterEmails: e.target.checked };
                      setPreferences(newPrefs);
                      updatePreferences(newPrefs);
                    }}
                    className="checkbox checkbox-primary"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-700">Email Delivery Receipts</span>
                    <p className="text-sm text-gray-600">Get confirmation when emails are successfully delivered</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailDeliveryReceipts}
                    onChange={(e) => {
                      const newPrefs = { ...preferences, emailDeliveryReceipts: e.target.checked };
                      setPreferences(newPrefs);
                      updatePreferences(newPrefs);
                    }}
                    className="checkbox checkbox-primary"
                  />
                </label>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <FaEnvelope className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">Email Delivery Information</h4>
                    <p className="text-sm text-blue-700">
                      All critical notifications (like certificate deliveries and account security) will always be sent 
                      regardless of these preferences to ensure platform security and functionality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;