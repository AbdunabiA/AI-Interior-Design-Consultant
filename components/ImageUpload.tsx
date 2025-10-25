import React, { useState, useCallback } from 'react';
import UploadIcon from './icons/UploadIcon';

interface ImageUploadProps {
  onImageUpload: (imageData: { data: string; mimeType: string }) => void;
  isLoading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, isLoading }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      onImageUpload({ data: base64String, mimeType: file.type });
    };
    reader.onerror = () => {
      setError('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-cyan-400');
    if (isLoading) return;
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  }, [isLoading]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isLoading) {
       event.currentTarget.classList.add('border-cyan-400');
    }
  };
  
  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.classList.remove('border-cyan-400');
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center p-8">
      <div 
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className="border-2 border-dashed border-gray-600 rounded-xl p-10 cursor-pointer hover:border-cyan-500 transition-all duration-300 bg-gray-800/50"
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
          disabled={isLoading}
        />
        <label htmlFor="file-upload" className="flex flex-col items-center gap-4 cursor-pointer">
            <UploadIcon className="w-12 h-12 text-gray-500" />
            <span className="text-gray-400 font-semibold">Drag & drop your room photo here</span>
            <span className="text-gray-500">or</span>
            <span className="bg-cyan-600 text-white px-6 py-2 rounded-md font-medium hover:bg-cyan-500 transition-colors">
                Browse Files
            </span>
        </label>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default ImageUpload;