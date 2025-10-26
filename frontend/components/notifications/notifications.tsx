"use client"

import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, Clock, Trash2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';

import type { Notification } from '@/mocks/mockData';

const Notifications = () => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [activeTab, setActiveTab] = useState('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'deadline':
        return <Clock className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(); 
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (activeTab) {
      case 'unread':
        return !notif.isRead;
      case 'action-required':
        return notif.actionRequired;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
            <p className="text-muted-foreground">Stay updated with important information and deadlines</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Stats Cards - Simplified Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Notifications</p>
            <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">Unread</p>
            <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">Action Required</p>
            <p className="text-2xl font-bold text-foreground">{actionRequiredCount}</p>
          </div>
        </Card>
      </div>

      {/* Tabs Section */}
      <Card className="p-6">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="action-required">Action Required ({actionRequiredCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <NotificationList 
              notifications={filteredNotifications}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              formatTimestamp={formatTimestamp}
              getNotificationIcon={getNotificationIcon}
            />
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            <NotificationList 
              notifications={filteredNotifications}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              formatTimestamp={formatTimestamp}
              getNotificationIcon={getNotificationIcon}
            />
          </TabsContent>

          <TabsContent value="action-required" className="mt-0">
            <NotificationList 
              notifications={filteredNotifications}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              formatTimestamp={formatTimestamp}
              getNotificationIcon={getNotificationIcon}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  formatTimestamp: (timestamp: string) => string;
  getNotificationIcon: (type: string) => React.ReactNode;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  formatTimestamp,
  getNotificationIcon
}) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No notifications to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`p-4 border rounded-lg ${
            !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-3 flex-1">
              {getNotificationIcon(notification.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{notification.title}</h3>
                  {notification.actionRequired && (
                    <Badge variant="destructive" className="text-xs">ACTION REQUIRED</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                  {notification.type === 'info' && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                      INFO
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-1 ml-4">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-8 w-8 p-0"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(notification.id)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
