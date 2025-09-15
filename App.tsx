import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import BeforeAfter from './components/BeforeAfter';
import Offer from './components/Offer';
import CTA from './components/CTA';
import Footer from './components/Footer';
import FixedCtaButton from './components/FixedCtaButton';
import EspelhoImperio from './components/EspelhoImperio';

const App: React.FC = () => {
  return (
    <div className="bg-black text-white font-sans">
      <Header />
      <main>
        <Hero />
        <EspelhoImperio />
        <BeforeAfter />
        <Offer />
        <CTA />
      </main>
      <Footer />
      <FixedCtaButton />
    </div>
  );
};

export default App;