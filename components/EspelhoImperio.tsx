import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { WHATSAPP_LINK } from '../constants';
import LeadCapturePopup from './LeadCapturePopup';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type UploadStep = 'initial' | 'processing';
type HistoryItem = {
    original: string;
    generated: string;
    type: 'image' | 'video';
};

const getFriendlyErrorMessage = (error: unknown): string => {
    const defaultMessage = "Não foi possível processar a imagem. Tente usar uma foto diferente, com boa iluminação e o rosto bem visível.";
    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        console.error("Erro original da IA:", error); // Log for debugging

        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('resource_exhausted')) {
            return "Nosso Espelho Mágico está muito popular no momento e atingiu sua capacidade máxima. Por favor, tente novamente mais tarde.";
        }
        if (errorMessage.includes('api key') || errorMessage.includes('billing')) {
            return "Ocorreu um problema técnico com nosso sistema. Nossa equipe já foi notificada. Por favor, tente novamente em alguns instantes.";
        }
        if (errorMessage.includes('não retornou uma imagem')) {
            return "A IA não conseguiu gerar uma transformação com esta foto. Tente uma imagem mais nítida, com o rosto bem visível e boa iluminação.";
        }
        return defaultMessage;
    }
    console.error("Erro desconhecido:", error);
    return defaultMessage;
};


const EspelhoImperio: React.FC = () => {
    const [originalMedia, setOriginalMedia] = useState<{ url: string; type: 'image' } | null>(null);
    const [generatedMedia, setGeneratedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
    const [tempGenerated, setTempGenerated] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    
    const [feedbackState, setFeedbackState] = useState<'idle' | 'prompt' | 'form' | 'thank_you_positive' | 'thank_you_negative'>('idle');
    const [feedbackChecklist, setFeedbackChecklist] = useState({
        not_straight: false,
        front_bad: false,
        face_changed: false,
        background_changed: false,
        video_glitch: false,
        other: '',
    });


    const imageFileInputRef = useRef<HTMLInputElement>(null);
    const desiredOutputTypeRef = useRef<'image' | 'video' | null>(null);

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('imperioHistory');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Falha ao carregar o histórico do localStorage", e);
            localStorage.removeItem('imperioHistory');
        }
    }, []);

    const resetState = (isNewSimulationStart = false) => {
        setOriginalMedia(null);
        setGeneratedMedia(null);
        setTempGenerated(null);
        setError(null);
        setIsLoading(false);
        setLoadingMessage('');
        setFeedbackState('idle');
        setFeedbackChecklist({ not_straight: false, front_bad: false, face_changed: false, background_changed: false, video_glitch: false, other: '' });
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
        
        const imageLoadingMessages = [
            "Um instante, a mágica já começou...",
            "Revelando o brilho imperial...",
            "Polindo os detalhes do seu novo visual...",
            "Sua versão mais poderosa está surgindo."
        ];
        setLoadingMessage(imageLoadingMessages[Math.floor(Math.random() * imageLoadingMessages.length)]);

        try {
            const base64Data = imageDataUrl.split(',')[1];
            const mimeType = imageDataUrl.split(';')[0].split(':')[1];

            const prompt = `TAREFA CENTRAL: Transformar o cabelo da pessoa para que fique PERFEITAMENTE LISO, brilhante e com movimento, como uma progressiva de luxo.

PROCESSO DE VERIFICAÇÃO INTERNA:
1.  **FOCO NA FRENTE:** A prioridade máxima é a perfeição do cabelo na parte da frente, incluindo franja e mechas ao redor do rosto.
2.  **REALISMO FACIAL:** Para um resultado perfeito, você PODE e DEVE fazer ajustes sutis e realistas na linha do cabelo e como ele interage com o rosto. A pessoa precisa ser 100% reconhecível.
3.  **REGRAS IMUTÁVEIS:** Roupas e fundo DEVEM permanecer inalterados.
4.  **AUTO-CORREÇÃO:** Antes de entregar o resultado final, verifique se todos os pontos acima foram cumpridos. Se o cabelo não estiver 100% liso ou se houver distorções, REFAÇA o trabalho até atingir a perfeição.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: mimeType } },
                        { text: prompt }
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
            setError(getFriendlyErrorMessage(err));
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
            
            const prompt = `[INSTRUÇÃO IMPERATIVA PARA IA DE VÍDEO]

**TAREFA CENTRAL:** A partir da foto fornecida, sua única missão é transformar TODO o cabelo da pessoa em um cabelo PERFEITAMENTE LISO E BRILHANTE, e criar um vídeo curto mostrando o resultado.

**AÇÃO DO VÍDEO:**
- Crie um vídeo de 4 segundos.
- A pessoa deve fazer um movimento de cabeça MUITO LENTO e SUTIL. O objetivo é apenas mostrar o balanço e o brilho do novo cabelo liso.

**[PROCESSO DE QUALIDADE E REFINAMENTO OBRIGATÓRIO]**

**REGRAS ABSOLUTAS:**
1.  **PRIORIDADE NO CABELO FRONTAL:** Sua missão principal é alisar TODO o cabelo, **dando atenção máxima à franja e às mechas que contornam o rosto**. O resultado deve ser impecável.
2.  **REALISMO FACIAL:** Para que o cabelo liso pareça natural, você TEM PERMISSÃO para fazer **ajustes sutis e realistas na linha do cabelo e na forma como ele cai sobre o rosto**. A pessoa deve permanecer 100% reconhecível.
3.  **INTOCÁVEIS:** As roupas e o cenário DEVEM permanecer 100% IDÊNTICOS e INALTERADOS.
4.  **SEM ARTEFATOS:** Não adicione elementos estranhos, distorções ou mudanças de cor no rosto ou no cenário.

**VERIFICAÇÃO FINAL (OBRIGATÓRIA):**
- Antes de finalizar, reveja o vídeo gerado.
- **Checklist:** O cabelo está 100% liso em todos os frames? O movimento é suave? O rosto está consistente e sem distorções? O fundo está estático?
- Se a resposta para qualquer uma dessas perguntas for "não", você DEVE corrigir o vídeo antes de entregá-lo. A qualidade final é inegociável.

**MANTER PROPORÇÃO:** ${orientationInstruction}. Mantenha a proporção original da imagem. Não corte a imagem nem adicione bordas.

Execute esta tarefa com precisão fotográfica.`;
            
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
                "Esculpindo sua obra-prima em vídeo...",
                "A perfeição leva um momento. Alinhando cada fio...",
                "Gerando o movimento e brilho que você merece.",
                "Sua transformação em 360° está quase pronta.",
                "Prepare-se para o glamour. Finalizando seu vídeo."
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
            setError(getFriendlyErrorMessage(err));
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleLeadSubmit = (data: { name: string; phone: string }) => {
        console.log("Lead Capturado:", data);
        if (tempGenerated && originalMedia) {
            setGeneratedMedia(tempGenerated);

            const newHistoryEntry: HistoryItem = {
                original: originalMedia.url,
                generated: tempGenerated.url,
                type: tempGenerated.type,
            };
            
            const updatedHistory = [newHistoryEntry, ...history].slice(0, 5);
            setHistory(updatedHistory);
            try {
                localStorage.setItem('imperioHistory', JSON.stringify(updatedHistory));
            } catch (e) {
                console.error("Falha ao salvar o histórico no localStorage", e);
            }
        }
        setShowPopup(false);
        setTempGenerated(null);
        setFeedbackState('prompt');
    };

     const handleFeedbackChecklistChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;

        setFeedbackChecklist(prev => ({
            ...prev,
            [name]: isCheckbox ? checked : value,
        }));
    };
    
    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Feedback recebido:", feedbackChecklist);
        setFeedbackState('thank_you_negative');
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

    const renderFeedbackSection = () => {
        switch (feedbackState) {
            case 'prompt':
                return (
                    <div className="mt-8 text-center animate-fade-in">
                        <h3 className="text-xl font-semibold text-white mb-4">Gostou da sua simulação?</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button onClick={() => setFeedbackState('thank_you_positive')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition-colors">
                                Sim, amei!
                            </button>
                            <button onClick={() => setFeedbackState('form')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-colors">
                                Não, pode melhorar
                            </button>
                        </div>
                    </div>
                );
            case 'thank_you_positive':
                return (
                    <div className="mt-8 text-center animate-fade-in p-6 bg-green-900/50 border border-green-500 rounded-lg">
                        <h3 className="text-xl font-semibold text-white mb-4">Que ótimo! Agende seu horário e transforme esse resultado em realidade.</h3>
                        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-block gold-gradient text-black font-bold text-lg py-3 px-8 rounded-full shadow-lg shadow-brand-gold/40 transform hover:scale-105 transition-all duration-300">
                            Agendar Agora
                        </a>
                    </div>
                );
            case 'form':
                return (
                    <div className="mt-8 text-left animate-fade-in p-6 bg-gray-800/50 border border-brand-gold/30 rounded-lg">
                        <h3 className="text-xl font-semibold text-white mb-4 text-center">O que podemos melhorar?</h3>
                        <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700/50 cursor-pointer"><input type="checkbox" name="not_straight" checked={feedbackChecklist.not_straight} onChange={handleFeedbackChecklistChange} className="form-checkbox h-5 w-5 text-brand-gold bg-gray-700 border-gray-600 focus:ring-brand-gold" /> <span>O cabelo não ficou 100% liso.</span></label>
                                <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700/50 cursor-pointer"><input type="checkbox" name="front_bad" checked={feedbackChecklist.front_bad} onChange={handleFeedbackChecklistChange} className="form-checkbox h-5 w-5 text-brand-gold bg-gray-700 border-gray-600 focus:ring-brand-gold" /> <span>A frente / franja não ficou boa.</span></label>
                                <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700/50 cursor-pointer"><input type="checkbox" name="face_changed" checked={feedbackChecklist.face_changed} onChange={handleFeedbackChecklistChange} className="form-checkbox h-5 w-5 text-brand-gold bg-gray-700 border-gray-600 focus:ring-brand-gold" /> <span>Meu rosto foi alterado.</span></label>
                                <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700/50 cursor-pointer"><input type="checkbox" name="background_changed" checked={feedbackChecklist.background_changed} onChange={handleFeedbackChecklistChange} className="form-checkbox h-5 w-5 text-brand-gold bg-gray-700 border-gray-600 focus:ring-brand-gold" /> <span>A roupa ou o fundo mudaram.</span></label>
                                {generatedMedia?.type === 'video' && <label className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700/50 cursor-pointer"><input type="checkbox" name="video_glitch" checked={feedbackChecklist.video_glitch} onChange={handleFeedbackChecklistChange} className="form-checkbox h-5 w-5 text-brand-gold bg-gray-700 border-gray-600 focus:ring-brand-gold" /> <span>O vídeo travou ou ficou estranho.</span></label>}
                            </div>
                             <textarea name="other" value={feedbackChecklist.other} onChange={handleFeedbackChecklistChange} placeholder="Outro? (Opcional)" className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-2 mt-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-colors" rows={2}></textarea>
                            <button type="submit" className="w-full gold-gradient text-black font-bold text-lg py-3 mt-3 rounded-full shadow-lg shadow-brand-gold/40 hover:scale-105 transition-all duration-300">Enviar Feedback</button>
                        </form>
                    </div>
                );
            case 'thank_you_negative':
                 return (
                    <div className="mt-8 text-center animate-fade-in p-6 bg-blue-900/50 border border-blue-500 rounded-lg">
                        <h3 className="text-xl font-semibold text-white">Obrigado pelo seu feedback! Estamos sempre melhorando nossa IA para você.</h3>
                    </div>
                );
            default:
                return null;
        }
    }


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
                    
                    {generatedMedia && !isLoading && renderFeedbackSection()}

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
                
                {history.length > 0 && (
                    <div className="mt-20">
                        <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">
                            Seu Histórico de <span className="gold-text-gradient">Transformações</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {history.map((item, index) => (
                                <div key={index} className="bg-black/50 rounded-lg overflow-hidden border border-brand-gold/20 shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                                    <div className="grid grid-cols-2 gap-px bg-brand-gold/20">
                                        <img src={item.original} alt={`Antes ${history.length - index}`} className="w-full h-48 object-cover" />
                                        {item.type === 'image' ? (
                                            <img src={item.generated} alt={`Depois ${history.length - index}`} className="w-full h-48 object-cover" />
                                        ) : (
                                            <video src={item.generated} loop autoPlay muted playsInline className="w-full h-48 object-cover">
                                                Seu navegador não suporta vídeos.
                                            </video>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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