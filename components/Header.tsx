
import React, { useState } from 'react';
import { MENU_ITEMS } from '../constants';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <header className="bg-black/80 backdrop-blur-sm sticky top-0 z-50 py-4 px-6 md:px-10 shadow-lg shadow-brand-gold/10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <a href="#inicio" className="hover:opacity-80 transition-opacity">
              Império <span className="gold-text-gradient">Progressivas</span>
            </a>
          </h1>
          <nav className="hidden md:flex items-center space-x-8">
            {MENU_ITEMS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white hover:text-brand-gold transition-colors duration-300 font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white focus:outline-none z-50" aria-label="Menu">
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              )}
            </button>
          </div>
        </div>
      </header>
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/95 z-40 flex flex-col items-center justify-center space-y-8 animate-fade-in">
          {MENU_ITEMS.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={toggleMenu}
              className="text-white text-2xl hover:text-brand-gold transition-colors duration-300 font-medium"
            >
              {item.name}
            </a>
          ))}
        </div>
      )}
    </>
  );
};

export default Header;