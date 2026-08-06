import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { compressImageDataUrl } from '../../utils/imageCompression';

interface ImageUploadProps {
  name: string;
  defaultValue?: string;
  className?: string;
  onChange?: (dataUrl: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ name, defaultValue, className = '', onChange }) => {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [urlValue, setUrlValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(defaultValue || null);
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = defaultValue || '';
    }
  }, [defaultValue]);

  const updateImage = (value: string) => {
    setPreview(value || null);
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = value || '';
    }
    if (onChange) onChange(value || '');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = await compressImageDataUrl(reader.result as string);
        updateImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlValue.trim()) {
      updateImage(urlValue.trim());
      setShowUrlInput(false);
      setUrlValue('');
    }
  };

  const handleClear = () => {
    updateImage('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`w-full ${className}`}>
      <input 
        type="hidden" 
        name={name} 
        ref={hiddenInputRef} 
        value={preview || ''} 
        onChange={() => {}}
      />
      
      {preview ? (
        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-primary/10 group">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-3 bg-white/90 text-primary rounded-full hover:bg-white transition-colors shadow-lg"
              title="Changer d'image"
            >
              <Upload size={20} />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              title="Supprimer l'image"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : showUrlInput ? (
        <div className="w-full p-4 rounded-2xl border border-primary/20 bg-secondary/30 flex flex-col gap-3">
          <label className="text-xs font-bold text-primary/70">URL de l'image</label>
          <div className="flex gap-2">
            <input 
              type="url" 
              placeholder="https://example.com/image.jpg" 
              value={urlValue} 
              onChange={(e) => setUrlValue(e.target.value)} 
              className="flex-1 px-4 py-2 text-sm rounded-xl border border-primary/20 bg-white focus:outline-none focus:border-primary"
            />
            <button 
              type="button" 
              onClick={handleApplyUrl} 
              className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
            >
              OK
            </button>
          </div>
          <button 
            type="button" 
            onClick={() => setShowUrlInput(false)} 
            className="text-xs text-primary/50 hover:underline text-left"
          >
            Annuler
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex-1 h-36 rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-primary/60 hover:text-primary"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload size={20} />
            </div>
            <span className="font-bold text-xs">Uploader une image</span>
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="px-6 h-36 rounded-2xl border border-primary/15 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-primary/60 hover:text-primary"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <LinkIcon size={20} />
            </div>
            <span className="font-bold text-xs">Utiliser une URL</span>
          </button>
        </div>
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

