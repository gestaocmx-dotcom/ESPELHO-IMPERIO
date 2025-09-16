import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { WHATSAPP_LINK } from '../constants';
import LeadCapturePopup from './LeadCapturePopup';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type UploadStep = 'initial' | 'processing';

const EspelhoImperio: React.FC = () => {
    const [originalMedia, setOriginalMedia] = useState<{ url: string; type: 'image' } | null>(null);
    const [generatedMedia, setGeneratedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
    const [tempGenerated, setTempGenerated] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    
    const imageFileInputRef = useRef<HTMLInputElement>(null);
    const desiredOutputTypeRef = useRef<'image' | 'video' | null>(null);

    const resetState = (isNewSimulationStart = false) => {
        setOriginalMedia(null);
        setGeneratedMedia(null);
        setTempGenerated(null);
        setError(null);
        setIsLoading(false);
        setLoadingMessage('');
        if (imageFileInputRef.current) imageFileInputRef.current.value = '';
        if (isNewSimulationStart) {
            desiredOutputTypeRef.current = null;
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        resetState();
        
        const reader = new FileReader();
        reader.onloadend = () => {
            const imageDataUrl = reader.result as string;
            setOriginalMedia({ url: imageDataUrl, type: 'image' });
            if (desiredOutputTypeRef.current === 'video') {
                generateVideoFromImage(imageDataUrl);
            } else {
                generateImageFromImage(imageDataUrl);
            }
        };
        reader.onerror = () => setError("Ocorreu um erro ao ler a imagem.");
        reader.readAsDataURL(file);
    };
    
    const generateImageFromImage = async (imageDataUrl: string) => {
        setIsLoading(true);
        setError(null);
        setLoadingMessage("Criando sua foto... Isso é rápido!");

        try {
            const base64Data = imageDataUrl.split(',')[1];
            const mimeType = imageDataUrl.split(';')[0].split(':')[1];

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: mimeType } },
                        { text: 'URGENTE: Transforme o cabelo da pessoa para que fique perfeitamente liso, com brilho espelhado e sem frizz, como se tivesse feito uma progressiva de luxo. Mantenha o rosto, roupas e fundo INALTERADOS. O foco é apenas no cabelo.' }
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);

            if (imagePart && imagePart.inlineData) {
                const base64ImageBytes = imagePart.inlineData.data;
                const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
                setTempGenerated({ url: imageUrl, type: 'image' });
                setShowPopup(true);
            } else {
                 throw new Error("A IA não retornou uma imagem transformada. Tente outra foto.");
            }
        } catch(err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            setError(`A IA não conseguiu processar esta imagem. Por favor, tente uma foto mais nítida. Detalhe: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const getImageDimensions = (dataUrl: string): Promise<{ width: number, height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => reject(new Error("Não foi possível carregar as dimensões da imagem."));
            img.src = dataUrl;
        });
    };

    const generateVideoFromImage = async (imageDataUrl: string) => {
        setIsLoading(true);
        setError(null);
        setLoadingMessage("Analisando sua imagem...");
        
        try {
            const dimensions = await getImageDimensions(imageDataUrl);
            const aspectRatio = dimensions.width / dimensions.height;
            let orientationInstruction = '';
            if (aspectRatio < 0.95) orientationInstruction = 'O vídeo final DEVE estar em uma orientação vertical (portrait), exatamente como a foto original.';
            else if (aspectRatio > 1.05) orientationInstruction = 'O vídeo final DEVE estar em uma orientação horizontal (landscape), exatamente como a foto original.';
            else orientationInstruction = 'O vídeo final DEVE ser um quadrado, exatamente como a foto original.';
            
            const prompt = `DIRETIVA IMPERATIVA: Crie um vídeo fotorrealista de 4 segundos a partir da imagem fornecida, com foco total na transformação capilar.

1. **TRANSFORMAÇÃO CAPILAR (PRIORIDADE MÁXIMA):** O cabelo da pessoa na imagem DEVE ser radicalmente transformado em um liso perfeito, luxuoso e com brilho de espelho. ELIMINE 100% dos cachos, ondas ou frizz originais. O resultado deve parecer uma progressiva de salão de altíssima qualidade.

2. **SEQUÊNCIA DE CÂMERA (CRÍTICO):** O vídeo DEVE mostrar a transformação de 3 ângulos distintos para valorizar o resultado:
    *   **Ângulo 1 (Frontal - 1.5s):** Comece com a pessoa olhando para a frente. Faça um zoom lento e sutil para focar no brilho e na textura do cabelo liso.
    *   **Ângulo 2 (Perfil - 1.5s):** A pessoa vira a cabeça lentamente para um dos lados, exibindo o caimento e o alinhamento perfeito dos fios de perfil.
    *   **Ângulo 3 (Costas/Movimento - 1s):** A pessoa vira a cabeça de volta para a frente, fazendo o cabelo balançar suavemente para mostrar o movimento e a leveza do liso.

3. **CONSISTÊNCIA E REALISMO (OBRIGATÓRIO):** O rosto, corpo, roupas e o fundo da imagem original DEVEM ser preservados com exatidão. A única alteração é o cabelo. O realismo é fundamental.

4. **PROPORÇÃO (MANDATÓRIO):** ${orientationInstruction} Mantenha a proporção exata da imagem original. Não adicione bordas pretas nem corte a imagem.`;
            
            const base64Data = imageDataUrl.split(',')[1];
            const mimeType = imageDataUrl.split(';')[0].split(':')[1];
            
            setLoadingMessage("Criando seu vídeo... Isso pode levar alguns minutos.");

            let operation = await ai.models.generateVideos({
                model: 'veo-2.0-generate-001',
                prompt: prompt,
                image: { imageBytes: base64Data, mimeType: mimeType },
                config: { numberOfVideos: 1 }
            });

            const loadingMessages = [
                "Nossa IA está esculpindo seu novo visual... A realeza leva um tempo para se preparar.",
                "Estamos alinhando cada fio para um liso perfeito. Prepare-se para o brilho!",
                "A mágica está acontecendo! Transformando seu cabelo em uma obra de arte.",
                "Finalizando os detalhes que fazem a diferença. Seu novo eu está quase pronto.",
                "A contagem regressiva para o seu cabelo dos sonhos começou. Você vai amar!"
            ];
            for (let i = 0; !operation.done; i++) {
                setLoadingMessage(loadingMessages[i % loadingMessages.length]);
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            if (operation.error) throw new Error(`A geração do vídeo falhou: ${operation.error.message || 'Erro desconhecido'}`);
            
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

            if (downloadLink) {
                setLoadingMessage("Buscando seu vídeo...");
                const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                if (!videoResponse.ok) throw new Error('Falha ao baixar o vídeo gerado.');
                const videoBlob = await videoResponse.blob();
                const videoUrl = URL.createObjectURL(videoBlob);
                setTempGenerated({ url: videoUrl, type: 'video' });
                setShowPopup(true);
            } else {
                setError("Não foi possível gerar a transformação. Tente outra imagem.");
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            setError(`A IA não conseguiu processar esta imagem. Por favor, tente uma foto mais nítida. Detalhe: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleLeadSubmit = (data: { name: string; phone: string }) => {
        console.log("Lead Capturado:", data);
        if (tempGenerated) {
            setGeneratedMedia(tempGenerated);
        }
        setShowPopup(false);
        setTempGenerated(null);
    };

    const renderMedia = (media: { url: string; type: 'image' | 'video' } | null) => {
        if (!media) return null;
        if (media.type === 'image') {
            return <img src={media.url} alt="Cabelo" className="max-w-full max-h-full object-contain rounded-md" />;
        }
        return (
            <video src={media.url} autoPlay loop muted playsInline className="max-w-full max-h-full object-contain rounded-md">
                Seu navegador não suporta a tag de vídeo.
            </video>
        );
    };
    
    const handleGenerateClick = (outputType: 'image' | 'video') => {
        desiredOutputTypeRef.current = outputType;
        imageFileInputRef.current?.click();
    };

    return (
        <section id="espelho-imperio" className="py-20 px-4 bg-gray-900/30">
            {showPopup && <LeadCapturePopup onSubmit={handleLeadSubmit} />}
            <div className="container mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    <span className="gold-text-gradient">Espelho Império</span> ✨
                </h2>
                <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
                    Veja a mágica acontecer! Envie uma foto e nossa IA simulará o resultado da sua progressiva.
                </p>
                
                <div className="max-w-4xl mx-auto p-6 bg-black/50 rounded-2xl border-2 border-brand-gold/30 shadow-2xl shadow-brand-gold/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-600 rounded-lg h-96 bg-gray-900/50">
                            {originalMedia ? renderMedia(originalMedia) : (
                                <div className="text-gray-400 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="mt-2">Sua foto aparecerá aqui.</p>
                                    <p className="text-xs mt-1">Para um resultado ideal, use uma foto de frente e com boa iluminação.</p>
                                </div>
                            )}
                            <p className="text-center mt-2 text-sm font-bold tracking-widest text-gray-400">ANTES</p>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-brand-gold/50 rounded-lg h-96 bg-gray-900/50 relative">
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col justify-center items-center rounded-lg z-10 p-4 text-center">
                                    <div className="w-16 h-16 border-4 border-dashed border-brand-gold rounded-full animate-spin"></div>
                                    <p className="text-white mt-4">{loadingMessage}</p>
                                </div>
                            )}
                            {error && !isLoading && <div className="text-red-400 text-center p-4"><p>{error}</p></div>}
                            {!isLoading && !error && generatedMedia && renderMedia(generatedMedia)}
                            {!isLoading && !error && !generatedMedia && (
                                <div className="text-brand-gold/70 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.55a1 1 0 011.45.89V14a1 1 0 01-1.45.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    <p className="mt-2">Sua simulação aparecerá aqui.</p>
                                </div>
                            )}
                            <p className="text-center mt-2 text-sm font-bold tracking-widest text-brand-gold">DEPOIS (IA)</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <input type="file" accept="image/*" onChange={handleFileChange} ref={imageFileInputRef} className="hidden" aria-hidden="true"/>

                        {originalMedia && !isLoading ? (
                             <button onClick={() => resetState(true)} className="gold-gradient text-black font-bold text-lg py-4 px-10 rounded-full shadow-lg shadow-brand-gold/40 transform hover:scale-105 transition-all duration-300">
                                Fazer outra simulação
                            </button>
                        ) : (
                            <div className="flex flex-col items-center space-y-4">
                               <p className="text-gray-300 mb-2">Escolha o tipo de simulação (a partir da sua foto):</p>
                               <div className="flex flex-wrap justify-center gap-4">
                                  <button onClick={() => handleGenerateClick('image')} disabled={isLoading} className="gold-gradient text-black font-bold text-lg py-3 px-8 rounded-full shadow-lg shadow-brand-gold/40 hover:scale-105 transition-all duration-300 disabled:opacity-50">
                                      Gerar Imagem <span className="font-normal">(Rápido)</span>
                                  </button>
                                  <button onClick={() => handleGenerateClick('video')} disabled={isLoading} className="gold-gradient text-black font-bold text-lg py-3 px-8 rounded-full shadow-lg shadow-brand-gold/40 hover:scale-105 transition-all duration-300 disabled:opacity-50">
                                      Gerar Vídeo <span className="font-normal">(Beta)</span>
                                  </button>
                               </div>
                            </div>
                        )}
                    </div>
                     <p className="text-center text-xs text-gray-500 mt-6">O resultado é uma simulação gerada por IA e pode não representar o resultado final real.</p>
                </div>
                
                <div className="mt-16">
                    <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-block gold-gradient text-black font-bold text-lg py-4 px-10 rounded-full shadow-lg shadow-brand-gold/40 transform hover:scale-105 transition-all duration-300">
                        Fazer minha progressiva agora
                    </a>
                </div>
            </div>
        </section>
    );
};

export default EspelhoImperio;