"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'deadline';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionRequired?: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  unreadCount: number;
  actionRequiredCount: number;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'deadline',
    title: 'Report Deadline Approaching',
    message: 'Q3 2024 action plan report is due in 3 days. Please submit your progress data.',
    timestamp: '2024-01-15T10:30:00Z',
    isRead: false,
    actionRequired: true
  },
  {
    id: '2',
    type: 'success',
    title: 'Action Plan Approved',
    message: 'Your Gender Equality Initiative 2024 action plan has been approved by the Sub-Cluster Focal Person.',
    timestamp: '2024-01-14T14:20:00Z',
    isRead: false
  },
  {
    id: '3',
    type: 'info',
    title: 'New Comment on Report',
    message: 'Sarah Johnson commented on your Q2 2024 progress report: "Great work on achieving 95% of planned targets."',
    timestamp: '2024-01-14T09:15:00Z',
    isRead: true
  },
  {
    id: '4',
    type: 'warning',
    title: 'KPI Target Behind Schedule',
    message: 'Women Leadership Training program is currently at 60% of planned target. Consider reviewing implementation strategy.',
    timestamp: '2024-01-13T16:45:00Z',
    isRead: true
  },
  {
    id: '5',
    type: 'info',
    title: 'System Maintenance Scheduled',
    message: 'The platform will undergo scheduled maintenance on January 20th from 2:00 AM to 4:00 AM EAT.',
    timestamp: '2024-01-12T11:00:00Z',
    isRead: true
  }
];

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length;

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

  return (
    <NotificationsContext.Provider value={{
      notifications,
      setNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      unreadCount,
      actionRequiredCount
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}