import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadZoneProps {
  onImagesAdded: (files: File[]) => void;
  imageCount: number;
}

export const ImageUploadZone = ({ onImagesAdded, imageCount }: ImageUploadZoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onImagesAdded(acceptedFiles);
  }, [onImagesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer",
        "bg-card hover:bg-card/80",
        isDragActive ? "border-primary bg-primary/5" : "border-border"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        {isDragActive ? (
          <>
            <Upload className="w-12 h-12 text-primary animate-bounce" />
            <p className="text-lg font-medium text-primary">Drop images here</p>
          </>
        ) : (
          <>
            <ImageIcon className="w-12 h-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium text-foreground mb-1">
                Drag & drop images here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to select files (PNG, JPG)
              </p>
            </div>
            {imageCount > 0 && (
              <div className="mt-2 px-4 py-2 bg-primary/10 rounded-full">
                <p className="text-sm font-medium text-primary">
                  {imageCount} {imageCount === 1 ? 'image' : 'images'} added
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
