import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { WHATSAPP_LINK } from '../constants';
import LeadCapturePopup from './LeadCapturePopup';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const EspelhoImperio: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [tempGeneratedImage, setTempGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageDataUrl = reader.result as string;
                setOriginalImage(imageDataUrl);
                setGeneratedImage(null);
                setTempGeneratedImage(null);
                setError(null);
                generateTransformation(imageDataUrl);
            };
            reader.onerror = () => {
                setError("Ocorreu um erro ao ler a imagem.");
            }
            reader.readAsDataURL(file);
        }
    };

    const generateTransformation = async (imageDataUrl: string) => {
        if (!imageDataUrl) {
            setError("Nenhuma imagem selecionada.");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const base64Data = imageDataUrl.split(',')[1];
            const mimeType = imageDataUrl.split(';')[0].split(':')[1];

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: mimeType } },
                        { text: 'Aplique um tratamento de progressiva profissional no cabelo da pessoa na imagem. O resultado deve ser um cabelo perfeitamente liso, com brilho intenso, sem frizz e com aparência saudável. Mantenha o resto da imagem (rosto, fundo, etc.) inalterado.' }
                    ]
                },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

            if (imagePart && imagePart.inlineData) {
                const newImageBase64 = imagePart.inlineData.data;
                const newImageMimeType = imagePart.inlineData.mimeType;
                const fullImageData = `data:${newImageMimeType};base64,${newImageBase64}`;
                setTempGeneratedImage(fullImageData);
                setShowPopup(true);
            } else {
                setError("Não foi possível gerar a transformação. Tente outra imagem.");
            }

        } catch (err) {
            console.error(err);
            setError("A IA não conseguiu processar esta imagem. Por favor, tente uma foto mais nítida.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeadSubmit = (data: { name: string; email: string; phone: string }) => {
        console.log("Lead Capturado:", data); // Aqui você enviaria os dados para seu CRM ou lista de e-mails
        if (tempGeneratedImage) {
            setGeneratedImage(tempGeneratedImage);
        }
        setShowPopup(false);
        setTempGeneratedImage(null);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <section id="espelho-imperio" className="py-20 px-4 bg-gray-900/30">
            {showPopup && <LeadCapturePopup onSubmit={handleLeadSubmit} />}
            <div className="container mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    <span className="gold-text-gradient">Espelho Império</span> ✨
                </h2>
                <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
                    Veja a mágica acontecer! Envie uma foto do seu cabelo e nossa IA mostrará uma simulação do resultado da sua progressiva.
                </p>
                
                <div className="max-w-4xl mx-auto p-6 bg-black/50 rounded-2xl border-2 border-brand-gold/30 shadow-2xl shadow-brand-gold/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        {/* Imagem Original */}
                        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-600 rounded-lg h-96 bg-gray-900/50">
                            {originalImage ? (
                                <img src={originalImage} alt="Cabelo antes da transformação" className="max-w-full max-h-full object-contain rounded-md" />
                            ) : (
                                <div className="text-gray-400 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="mt-2">Sua foto aparecerá aqui.</p>
                                    <p className="text-xs mt-1">Use uma foto nítida do seu cabelo.</p>
                                </div>
                            )}
                             <p className="text-center mt-2 text-sm font-bold tracking-widest text-gray-400">ANTES</p>
                        </div>

                        {/* Imagem Gerada */}
                        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-brand-gold/50 rounded-lg h-96 bg-gray-900/50 relative">
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center rounded-lg z-10">
                                    <div className="w-16 h-16 border-4 border-dashed border-brand-gold rounded-full animate-spin"></div>
                                    <p className="text-white mt-4">Alisando seus fios...</p>
                                </div>
                            )}
                            {error && !isLoading && (
                                 <div className="text-red-400 text-center">
                                    <p>{error}</p>
                                 </div>
                            )}
                            {!isLoading && !error && generatedImage && (
                                 <img src={generatedImage} alt="Cabelo após a transformação com IA" className="max-w-full max-h-full object-contain rounded-md" />
                            )}
                            {!isLoading && !error && !generatedImage && (
                                <div className="text-brand-gold/70 text-center">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                     <p className="mt-2">A transformação aparecerá aqui.</p>
                                </div>
                            )}
                            <p className="text-center mt-2 text-sm font-bold tracking-widest text-brand-gold">DEPOIS (IA)</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            ref={fileInputRef}
                            className="hidden"
                            aria-hidden="true"
                        />
                        <button
                            onClick={triggerFileInput}
                            disabled={isLoading}
                            className="gold-gradient text-black font-bold text-lg py-4 px-10 rounded-full shadow-lg shadow-brand-gold/40 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processando...' : (originalImage ? 'Enviar outra foto' : 'Escolher foto')}
                        </button>
                    </div>
                     <p className="text-center text-xs text-gray-500 mt-6">O resultado é uma simulação gerada por IA e pode não representar o resultado final real.</p>
                </div>
                
                <div className="mt-16">
                    <a
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block gold-gradient text-black font-bold text-lg py-4 px-10 rounded-full shadow-lg shadow-brand-gold/40 transform hover:scale-105 transition-all duration-300"
                    >
                        Fazer minha progressiva agora
                    </a>
                </div>
            </div>
        </section>
    );
};

export default EspelhoImperio;