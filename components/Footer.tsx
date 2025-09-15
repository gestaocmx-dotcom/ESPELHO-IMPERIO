
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 px-4">
      <div className="container mx-auto text-center">
        <h3 className="text-xl font-bold mb-2">
            Império <span className="gold-text-gradient">Progressivas</span>
        </h3>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Império Progressivas. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
