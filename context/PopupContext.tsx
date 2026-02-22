import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CustomPopup } from '../components/CustomPopup';

interface PopupContextProps {
  showAlert: (message: string, type?: 'success' | 'error' | 'info') => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
}

const PopupContext = createContext<PopupContextProps | undefined>(undefined);

export const PopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    message: string;
    alertType?: 'success' | 'error' | 'info';
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: 'alert',
    message: '',
  });

  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    return new Promise<void>((resolve) => {
      setPopup({
        isOpen: true,
        type: 'alert',
        message,
        alertType: type,
        onConfirm: () => {
          setPopup((prev) => ({ ...prev, isOpen: false }));
          resolve();
        },
      });
    });
  };

  const showConfirm = (message: string) => {
    return new Promise<boolean>((resolve) => {
      setPopup({
        isOpen: true,
        type: 'confirm',
        message,
        onConfirm: () => {
          setPopup((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setPopup((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  };

  return (
    <PopupContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {popup.isOpen && (
        <CustomPopup
          message={popup.message}
          type={popup.type}
          alertType={popup.alertType}
          onConfirm={popup.onConfirm!}
          onCancel={popup.onCancel}
        />
      )}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};