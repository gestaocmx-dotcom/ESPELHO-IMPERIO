
import React from 'react';

interface BeforeAfterCardProps {
  seedBefore: string;
  seedAfter: string;
}

const BeforeAfterCard: React.FC<BeforeAfterCardProps> = ({ seedBefore, seedAfter }) => (
    <div className="bg-gray-900/50 rounded-lg overflow-hidden border border-brand-gold/20 shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
        <div className="grid grid-cols-2 gap-1">
            <img src={`https://picsum.photos/seed/${seedBefore}/400/500`} alt="Antes" className="w-full h-full object-cover" />
            <img src={`https://picsum.photos/seed/${seedAfter}/400/500`} alt="Depois" className="w-full h-full object-cover" />
        </div>
        <p className="text-center text-xs text-gray-400 py-3">Imagem meramente ilustrativa</p>
    </div>
);


const BeforeAfter: React.FC = () => {
    const images = [
        { seedBefore: 'woman1-before', seedAfter: 'woman1-after' },
        { seedBefore: 'woman2-before', seedAfter: 'woman2-after' },
        { seedBefore: 'woman3-before', seedAfter: 'woman3-after' },
        { seedBefore: 'woman4-before', seedAfter: 'woman4-after' },
        { seedBefore: 'woman5-before', seedAfter: 'woman5-after' },
        { seedBefore: 'woman6-before', seedAfter: 'woman6-after' },
    ];

  return (
    <section id="antes-depois" className="py-20 px-4 bg-black">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Veja quem já viveu a <span className="gold-text-gradient">transformação</span>
        </h2>
        <p className="text-lg text-gray-300 mb-12">
            A transformação que você também pode conquistar.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((img, index) => (
                <BeforeAfterCard key={index} seedBefore={img.seedBefore} seedAfter={img.seedAfter} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;