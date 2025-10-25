import React from 'react';
import type { DesignStyle } from '../types';

interface StyleCarouselProps {
  styles: DesignStyle[];
  generatedImages: Record<string, string>;
  selectedStyle: string;
  onSelectStyle: (styleName: string) => void;
}

const StyleCarousel: React.FC<StyleCarouselProps> = ({ styles, generatedImages, selectedStyle, onSelectStyle }) => {
  return (
    <div className="w-full py-4">
      <h3 className="text-lg font-semibold text-gray-300 mb-3 text-center">Choose a Style</h3>
      <div className="flex justify-center gap-4 overflow-x-auto pb-4">
        {styles.map((style) => (
          <button
            key={style.name}
            onClick={() => onSelectStyle(style.name)}
            disabled={!generatedImages[style.name]}
            className={`flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden relative transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/80
              ${selectedStyle === style.name ? 'ring-4 ring-cyan-500' : 'ring-2 ring-gray-700'}
              ${!generatedImages[style.name] ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <img 
              src={generatedImages[style.name] ? `data:image/png;base64,${generatedImages[style.name]}` : style.imageUrl} 
              alt={style.name} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/50 flex items-end p-2">
              <span className="text-white text-sm font-semibold">{style.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleCarousel;