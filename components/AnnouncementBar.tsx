import React, { useEffect, useState } from 'react';
import { getStoreSettings } from '../services/productService';

export const AnnouncementBar: React.FC = () => {
  const [text, setText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getStoreSettings();
      if (settings.showAnnouncement && settings.announcementText) {
        setText(settings.announcementText);
        setIsVisible(true);
      }
    };
    fetchSettings();
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-dark-900 text-white overflow-hidden h-8 flex items-center relative z-[60]">
      <div className="whitespace-nowrap animate-marquee">
        <span className="mx-4 text-xs font-bold uppercase tracking-widest">{text}</span>
        <span className="mx-4 text-gold-500">•</span>
        <span className="mx-4 text-xs font-bold uppercase tracking-widest">{text}</span>
        <span className="mx-4 text-gold-500">•</span>
        <span className="mx-4 text-xs font-bold uppercase tracking-widest">{text}</span>
        <span className="mx-4 text-gold-500">•</span>
        <span className="mx-4 text-xs font-bold uppercase tracking-widest">{text}</span>
        <span className="mx-4 text-gold-500">•</span>
      </div>
      
      <style>{`
        .animate-marquee {
          animation: marquee 20s linear infinite;
          display: inline-block;
          padding-left: 100%;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};