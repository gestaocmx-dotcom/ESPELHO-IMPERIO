import React from 'react';

const Hero: React.FC = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center text-center overflow-hidden py-20 px-4">
       <div className="absolute inset-0 bg-black opacity-80 z-10"></div>
       <div className="absolute inset-0 z-0">
          <img src="https://picsum.photos/seed/hair-bg/1920/1080" alt="Fundo com cabelo estilizado" className="w-full h-full object-cover opacity-30"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
          <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-brand-gold/20 via-transparent to-transparent opacity-50"></div>
       </div>
       
       <div className="container mx-auto relative z-20 flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 max-w-3xl">
                Veja sua <span className="gold-text-gradient">transformação</span> antes de acontecer.
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
                ✨ Use nosso Espelho Império com IA e visualize o resultado da sua progressiva agora mesmo.
            </p>
            <div className="mt-12 animate-bounce">
                <a href="#espelho-imperio" aria-label="Rolar para o Espelho Império">
                    <svg className="w-10 h-10 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </a>
            </div>
       </div>
    </section>
  );
};

export default Hero;