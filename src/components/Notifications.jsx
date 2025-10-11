import React, { useState, useEffect } from 'react';
import CSEService from '../services/CSEService';
import './holdings.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState(null);

  // Fetch CSE announcements and combine with local notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recent CSE announcements
      const cseData = await CSEService.getRecentAnnouncements();
      
      // Extract and format announcements
      const cseNotifications = [];
      if (cseData.Announcement && cseData.Announcement['DEALINGS BY DIRECTORS']) {
        cseData.Announcement['DEALINGS BY DIRECTORS'].forEach(announcement => {
          const formattedNotification = CSEService.formatAnnouncementAsNotification(announcement);
          cseNotifications.push(formattedNotification);
        });
      }

      // Local/mock notifications
      const localNotifications = [
        
      ];

      // Combine and sort by timestamp (newest first)
      const allNotifications = [...cseNotifications, ...localNotifications].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );

      setNotifications(allNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch market announcements. Using cached data.');
      
      // Fallback to local notifications only
      const fallbackNotifications = [
        {
          id: 'local_1',
          type: 'portfolio',
          title: 'Portfolio Update',
          message: 'Your equity holdings have increased by 5.2% this week.',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'info',
          source: 'System'
        },
        {
          id: 'local_2',
          type: 'error',
          title: 'Connection Issue',
          message: 'Unable to fetch latest market announcements. Please check your internet connection.',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'error',
          source: 'System'
        }
      ];
      setNotifications(fallbackNotifications);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
  };

  // Fetch detailed information for a notification
  const handleShowDetails = async (notification) => {
    if (notification.source !== 'CSE' || !notification.rawData?.id) {
      // For non-CSE notifications, show the basic info
      setSelectedNotification(notification);
      setNotificationDetails(null);
      return;
    }

    try {
      setDetailsLoading(true);
      setSelectedNotification(notification);
      
      const details = await CSEService.getAnnouncementById(notification.rawData.id);
      setNotificationDetails(details);
    } catch (err) {
      console.error('Error fetching notification details:', err);
      setNotificationDetails({ error: 'Failed to load detailed information' });
    } finally {
      setDetailsLoading(false);
    }
  };

  // Close the details popup
  const closeDetails = () => {
    setSelectedNotification(null);
    setNotificationDetails(null);
    setDetailsLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'portfolio':
        return '📈';
      case 'alert':
        return '🔔';
      case 'system':
        return '⚙️';
      case 'market':
        return '🏛️';
      case 'error':
        return '🚫';
      default:
        return '📋';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="portfolio-container">
        <h2>Notifications</h2>
        <div className="loading-container">
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-container">
      <div className="notifications-header">
        <h2>Notifications</h2>
        <div className="notifications-actions">
          {error && (
            <span className="error-message" title={error}>
              ⚠️ Connection issues
            </span>
          )}
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
          <button 
            onClick={handleRefresh} 
            className="refresh-btn"
            disabled={refreshing}
            title="Refresh notifications"
          >
            {refreshing ? '🔄' : '↻'} Refresh
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="mark-all-read-btn">
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h3>No notifications</h3>
          <p>You're all caught up! New notifications will appear here.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : 'read'} ${notification.priority}`}
            >
              <div className="notification-content">
                <div className="notification-header">
                  <div className="notification-icons">
                    <span className="type-icon">{getTypeIcon(notification.type)}</span>
                    <span className="priority-icon">{getPriorityIcon(notification.priority)}</span>
                    {notification.source && (
                      <span className="source-badge">{notification.source}</span>
                    )}
                  </div>
                  <div className="notification-meta">
                    <span className="timestamp">{formatTimestamp(notification.timestamp)}</span>
                    {!notification.read && <div className="unread-dot"></div>}
                  </div>
                </div>
                
                <h4 className="notification-title">{notification.title}</h4>
                <p className="notification-message">{notification.message}</p>
                
                <div className="notification-actions">
                  <button 
                    onClick={() => handleShowDetails(notification)}
                    className="action-btn info-btn"
                    title="View details"
                  >
                    ℹ️ Details
                  </button>
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="action-btn mark-read-btn"
                    >
                      Mark as read
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notification.id)}
                    className="action-btn delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedNotification && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Notification Details</h3>
              <button onClick={closeDetails} className="close-btn">✕</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Title:</span>
                    <span className="detail-value">{selectedNotification.title}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedNotification.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Priority:</span>
                    <span className="detail-value">{selectedNotification.priority}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Source:</span>
                    <span className="detail-value">{selectedNotification.source}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{new Date(selectedNotification.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="detail-item full-width">
                  <span className="detail-label">Message:</span>
                  <p className="detail-message">{selectedNotification.message}</p>
                </div>
              </div>

              {/* CSE Specific Details */}
              {selectedNotification.source === 'CSE' && (
                <div className="detail-section">
                  <h4>Market Information</h4>
                  {detailsLoading ? (
                    <div className="loading-text">Loading detailed information...</div>
                  ) : notificationDetails?.error ? (
                    <div className="error-text">{notificationDetails.error}</div>
                  ) : notificationDetails?.reqBaseAnnouncement ? (
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Company Name:</span>
                        <span className="detail-value">{notificationDetails.reqBaseAnnouncement.companyName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Symbol:</span>
                        <span className="detail-value">{notificationDetails.reqBaseAnnouncement.symbol}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Director:</span>
                        <span className="detail-value">{notificationDetails.reqBaseAnnouncement.dircetorsName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Announcement Date:</span>
                        <span className="detail-value">{notificationDetails.reqBaseAnnouncement.dateOfAnnouncement}</span>
                      </div>
                      
                      {notificationDetails.reqBaseAnnouncement.remarks && (
                        <div className="detail-item full-width">
                          <span className="detail-label">Remarks:</span>
                          <p className="detail-message">{notificationDetails.reqBaseAnnouncement.remarks}</p>
                        </div>
                      )}

                      {/* Director Transactions */}
                      {notificationDetails.reqBaseAnnouncement.directorTransactions && 
                       notificationDetails.reqBaseAnnouncement.directorTransactions.length > 0 && (
                        <>
                          <div className="detail-separator"></div>
                          <div className="detail-item full-width">
                            <span className="detail-label">Director Transactions:</span>
                            <div className="transactions-container">
                              {notificationDetails.reqBaseAnnouncement.directorTransactions.map((transaction, index) => (
                                <div key={transaction.dirId || index} className="transaction-item">
                                  <div className="transaction-header">
                                    <span className="transaction-type">{transaction.transType}</span>
                                    <span className="transaction-date">{transaction.transactionDate}</span>
                                  </div>
                                  <div className="transaction-details">
                                    <div className="transaction-detail">
                                      <span className="transaction-label">Quantity:</span>
                                      <span className="transaction-value">{transaction.quantity?.toLocaleString()}</span>
                                    </div>
                                    <div className="transaction-detail">
                                      <span className="transaction-label">Price:</span>
                                      <span className="transaction-value">Rs. {transaction.price?.toLocaleString()}</span>
                                    </div>
                                    <div className="transaction-detail">
                                      <span className="transaction-label">Total Value:</span>
                                      <span className="transaction-value total-value">
                                        Rs. {(transaction.quantity * transaction.price)?.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Company:</span>
                        <span className="detail-value">{selectedNotification.rawData?.company}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Symbol:</span>
                        <span className="detail-value">{selectedNotification.rawData?.symbol}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Director:</span>
                        <span className="detail-value">{selectedNotification.rawData?.dircetorsName}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;