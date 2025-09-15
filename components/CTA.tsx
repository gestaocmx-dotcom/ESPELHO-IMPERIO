
import React from 'react';
import { WHATSAPP_LINK } from '../constants';

const CTA: React.FC = () => {
  return (
    <section id="agendamento" className="py-20 px-4 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/10 via-transparent to-brand-gold/10 opacity-50"></div>
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          A beleza que <span className="gold-text-gradient">transforma</span>.
        </h2>
        <p className="text-2xl text-gray-300 mb-10">
          O luxo que você merece.
        </p>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block gold-gradient text-black font-bold text-xl py-5 px-12 rounded-full shadow-xl shadow-brand-gold/40 transform hover:scale-105 transition-all duration-300"
        >
          Agende sua transformação agora
        </a>
      </div>
    </section>
  );
};

export default CTA;
