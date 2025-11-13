import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Image as ImageIcon, UploadCloud } from 'lucide-react';

interface Props {
  value?: string; // base64 string or URL
  onChange: (val: string) => void;
  className?: string;
}

/**
 * A small reusable avatar uploader component. It shows a preview thumbnail and allows
 * the user to click or drag-and-drop to upload a new image. The selected image is
 * converted to a Base64 data-URL and returned via onChange.
 */
export const AvatarUploader: React.FC<Props> = ({ value, onChange, className }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center border border-dashed rounded-lg p-4 cursor-pointer transition-colors',
        isDragOver ? 'bg-primary/10 border-primary' : 'border-muted',
        className
      )}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      {value ? (
        <img
          src={value}
          alt="Avatar preview"
          className="h-24 w-24 object-cover rounded-full shadow"
        />
      ) : (
        <div className="flex flex-col items-center text-muted-foreground">
          <UploadCloud className="h-8 w-8 mb-2" />
          <span className="text-sm">Click or drag image here</span>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {value && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-1 right-1"
          onClick={(e) => {
            e.stopPropagation();
            onChange('');
          }}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default AvatarUploader;
