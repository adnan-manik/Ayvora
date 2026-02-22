import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface CustomPopupProps {
  message: string;
  type: 'alert' | 'confirm';
  alertType?: 'success' | 'error' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
}

export const CustomPopup: React.FC<CustomPopupProps> = ({ message, type, alertType = 'info', onConfirm, onCancel }) => {
  const getIcon = () => {
    if (type === 'confirm') return <AlertCircle size={32} className="text-gold-500" />;
    switch (alertType) {
      case 'success': return <CheckCircle size={32} className="text-green-500" />;
      case 'error': return <AlertCircle size={32} className="text-red-500" />;
      default: return <Info size={32} className="text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-sm shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 animate-scale-up">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">{getIcon()}</div>
          <p className="text-dark-900 font-medium text-lg mb-6">{message}</p>
          
          <div className="flex gap-4 w-full">
            {type === 'confirm' && (
              <button 
                onClick={onCancel}
                className="flex-1 py-3 border border-gray-300 font-bold uppercase text-xs tracking-widest hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button 
              onClick={onConfirm}
              className={`flex-1 py-3 text-white font-bold uppercase text-xs tracking-widest transition-colors ${
                 alertType === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-dark-900 hover:bg-gold-600'
              }`}
            >
              {type === 'confirm' ? 'Confirm' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};