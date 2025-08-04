import React, { createContext, useContext, useState, useCallback } from 'react';
import AlertBanner from '@/components/ui/alert-banner';

interface Alert {
  id: string;
  type: 'welcome' | 'message' | 'match' | 'meeting' | 'success' | 'warning' | 'premium' | 'verification';
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  autoHide?: boolean;
  duration?: number;
  showBadge?: boolean;
  badgeText?: string;
}

interface AlertContextType {
  showAlert: (alert: Omit<Alert, 'id'>) => void;
  dismissAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = useCallback((alertData: Omit<Alert, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const alert = { ...alertData, id };
    
    setAlerts(prev => [...prev, alert]);
    
    // Auto-remove after duration if autoHide is true
    if (alert.autoHide) {
      setTimeout(() => {
        dismissAlert(id);
      }, alert.duration || 5000);
    }
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, dismissAlert }}>
      {children}
      {alerts.map(alert => (
        <AlertBanner
          key={alert.id}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          actionText={alert.actionText}
          onAction={alert.onAction}
          onDismiss={() => dismissAlert(alert.id)}
          autoHide={alert.autoHide}
          duration={alert.duration}
          showBadge={alert.showBadge}
          badgeText={alert.badgeText}
        />
      ))}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};