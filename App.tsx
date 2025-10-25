import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import ImageComparator from './components/ImageComparator';
import StyleCarousel from './components/StyleCarousel';
import Chat from './components/Chat';
import DownloadIcon from './components/icons/DownloadIcon';
import { generateStyledImage, refineImage, getChatResponse } from './services/geminiService';
import { DESIGN_STYLES, IMAGE_EDIT_KEYWORDS } from './constants';
import type { ChatMessage } from './types';

const App: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<{ data: string; mimeType: string } | null>(null);
    const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    const handleImageUpload = useCallback(async (imageData: { data: string; mimeType: string }) => {
        setOriginalImage(imageData);
        setGeneratedImages({});
        setSelectedStyle(null);
        setError(null);
        setChatHistory([]);
        setIsLoading(true);

        try {
            const firstStyle = DESIGN_STYLES[0];
            setLoadingMessage(`Generating ${firstStyle.name} style...`);
            const firstImage = await generateStyledImage(imageData.data, imageData.mimeType, firstStyle.prompt);
            setGeneratedImages({ [firstStyle.name]: firstImage });
            setSelectedStyle(firstStyle.name);

            // Generate other styles in the background
            Promise.all(DESIGN_STYLES.slice(1).map(async (style) => {
                const newImage = await generateStyledImage(imageData.data, imageData.mimeType, style.prompt);
                setGeneratedImages(prev => ({ ...prev, [style.name]: newImage }));
            })).catch(err => {
                 console.error("Error generating background styles:", err);
                 // Non-critical error, so we don't show it to the user
            });

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);
    
    const handleSendMessage = async (message: string) => {
        const newUserMessage: ChatMessage = { role: 'user', content: message };
        setChatHistory(prev => [...prev, newUserMessage]);
        setIsChatLoading(true);

        const isEditRequest = IMAGE_EDIT_KEYWORDS.some(keyword => message.toLowerCase().startsWith(keyword));

        try {
            if (isEditRequest && selectedStyle && generatedImages[selectedStyle] && originalImage) {
                setLoadingMessage(`Refining image: ${message}`);
                const refinedImage = await refineImage(generatedImages[selectedStyle], 'image/png', message);
                setGeneratedImages(prev => ({...prev, [selectedStyle]: refinedImage}));
                const botMessage: ChatMessage = { role: 'model', content: "Here's the updated design." };
                setChatHistory(prev => [...prev, botMessage]);
            } else {
                const imageContext = selectedStyle && generatedImages[selectedStyle] ? { data: generatedImages[selectedStyle], mimeType: 'image/png' } : undefined;
                const response = await getChatResponse(chatHistory, message, imageContext);
                const botMessage: ChatMessage = { role: 'model', content: response.text, products: response.products };
                setChatHistory(prev => [...prev, botMessage]);
            }
        } catch(err) {
            console.error(err);
            const errorMessage: ChatMessage = { role: 'model', content: err instanceof Error ? err.message : 'Sorry, something went wrong.' };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
            setLoadingMessage('');
        }
    }

    const activeGeneratedImage = selectedStyle ? generatedImages[selectedStyle] : null;

    const handleDownloadImage = useCallback(() => {
        if (!activeGeneratedImage || !selectedStyle) return;

        const link = document.createElement('a');
        link.href = `data:image/png;base64,${activeGeneratedImage}`;
        const fileName = `ai-design-${selectedStyle.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [activeGeneratedImage, selectedStyle]);


    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center text-gray-200">
            <Header />
            <main className="container mx-auto p-4 md:p-8 flex-1 w-full">
                {!originalImage && <ImageUpload onImageUpload={handleImageUpload} isLoading={isLoading} />}
                
                {isLoading && !originalImage && (
                    <div className="text-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                        <p className="mt-4 text-lg">{loadingMessage || 'Processing your image...'}</p>
                    </div>
                )}
                
                {error && <div className="text-center p-8 bg-red-900/50 border border-red-500 rounded-lg max-w-2xl mx-auto"><p className="font-semibold">Error</p><p>{error}</p></div>}

                {originalImage && (
                    <div className="flex flex-col items-center w-full">
                         {activeGeneratedImage ? (
                             <>
                                <div className="w-full max-w-4xl mx-auto relative">
                                    <ImageComparator 
                                        originalImage={`data:${originalImage.mimeType};base64,${originalImage.data}`}
                                        generatedImage={`data:image/png;base64,${activeGeneratedImage}`}
                                    />
                                     <button
                                        onClick={handleDownloadImage}
                                        className="absolute top-4 right-4 bg-gray-800/60 p-2 rounded-full text-white hover:bg-cyan-600/80 transition-colors z-20"
                                        aria-label="Download generated image"
                                        title="Download generated image"
                                    >
                                        <DownloadIcon className="w-6 h-6" />
                                    </button>
                                    {loadingMessage && isChatLoading && (
                                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg z-10">
                                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                                          <p className="mt-4 text-lg">{loadingMessage}</p>
                                      </div>
                                    )}
                                </div>
                                <StyleCarousel 
                                    styles={DESIGN_STYLES} 
                                    generatedImages={generatedImages}
                                    selectedStyle={selectedStyle || ''}
                                    onSelectStyle={setSelectedStyle}
                                />
                                <Chat chatHistory={chatHistory} onSendMessage={handleSendMessage} isLoading={isChatLoading} />
                             </>
                         ) : (
                            <div className="text-center p-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                                <p className="mt-4 text-lg">{loadingMessage || 'Generating initial design...'}</p>
                            </div>
                         )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;