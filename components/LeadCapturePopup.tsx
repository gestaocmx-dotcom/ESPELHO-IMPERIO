import React, { useState } from 'react';

interface LeadCapturePopupProps {
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
}

const LeadCapturePopup: React.FC<LeadCapturePopupProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && phone) {
      onSubmit({ name, email, phone });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gray-900 border-2 border-brand-gold/50 rounded-2xl shadow-2xl shadow-brand-gold/20 p-8 max-w-md w-full text-center">
        <h3 className="text-2xl font-bold mb-2 gold-text-gradient">Quase lá!</h3>
        <p className="text-gray-300 mb-6">Para ver sua transformação, por favor, preencha seus dados abaixo.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="sr-only">Nome</label>
            <input
              type="text"
              id="name"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-colors"
            />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-colors"
            />
          </div>
          <div>
            <label htmlFor="phone" className="sr-only">Telefone</label>
            <input
              type="tel"
              id="phone"
              placeholder="Seu WhatsApp (com DDD)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full gold-gradient text-black font-bold text-lg py-3 px-10 rounded-full shadow-lg shadow-brand-gold/40 transform hover:scale-105 transition-all duration-300"
          >
            Ver meu resultado
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-4">Prometemos não enviar spam. Seus dados estão seguros.</p>
      </div>
    </div>
  );
};

export default LeadCapturePopup;