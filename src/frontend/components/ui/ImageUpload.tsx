import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  name: string;
  defaultValue?: string;
  className?: string;
  onChange?: (dataUrl: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ name, defaultValue, className = '', onChange }) => {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = base64String;
        }
        if (onChange) onChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
    if (hiddenInputRef.current) hiddenInputRef.current.value = '';
    if (onChange) onChange('');
  };

  return (
    <div className={`w-full ${className}`}>
      <input 
        type="hidden" 
        name={name} 
        ref={hiddenInputRef} 
        defaultValue={defaultValue || ''} 
      />
      
      {preview ? (
        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-primary/10 group">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleClear}
              className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-48 rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-4 text-primary/60 hover:text-primary"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload size={24} />
          </div>
          <span className="font-bold text-sm">Cliquez pour ajouter une image</span>
        </button>
      )}
      
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
