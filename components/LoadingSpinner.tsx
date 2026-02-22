import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ size?: number, className?: string }> = ({ size = 48, className = "" }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 className="animate-spin text-gold-500" size={size} />
    </div>
  );
};
