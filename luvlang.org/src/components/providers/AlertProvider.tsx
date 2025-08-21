import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AlertContextType {
  showAlert: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const [alert, setAlert] = useState<{ message: string; type: string } | null>(null);

  const showAlert = (message: string, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <div className="fixed top-4 right-4 z-50 bg-love-card border border-love-border rounded-lg p-4 shadow-lg">
          <p className="text-love-text">{alert.message}</p>
        </div>
      )}
    </AlertContext.Provider>
  );
};