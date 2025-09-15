
import React from 'react';
import { WHATSAPP_LINK } from '../constants';

const FixedCtaButton: React.FC = () => {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 gold-gradient text-black font-bold py-3 px-6 rounded-full shadow-lg shadow-brand-gold/40 transform hover:scale-110 transition-all duration-300 animate-pulse"
    >
      Agende Agora
    </a>
  );
};

export default FixedCtaButton;
