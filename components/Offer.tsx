
import React from 'react';
import { WHATSAPP_LINK } from '../constants';

const Offer: React.FC = () => {
  return (
    <section id="preco" className="py-20 px-4 bg-white text-black">
      <div className="container mx-auto text-center max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="text-yellow-500">🔥</span> Sua progressiva a partir de <span className="gold-text-gradient">R$250,00</span> <span className="text-yellow-500">🔥</span>
        </h2>
        <p className="text-lg text-gray-700 mb-8">
          Agende agora e tenha fios lisos, brilhantes e com cara de salão de luxo.
        </p>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block gold-gradient text-black font-bold text-lg py-4 px-10 rounded-full shadow-lg shadow-brand-gold/40 transform hover:scale-105 transition-all duration-300"
        >
          Agendar minha avaliação
        </a>
      </div>
    </section>
  );
};

export default Offer;