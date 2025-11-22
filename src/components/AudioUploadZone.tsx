import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Music, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface AudioUploadZoneProps {
  onAudioAdded: (file: File) => void;
  onAudioRemoved: () => void;
  audioFile: File | null;
}

export const AudioUploadZone = ({ onAudioAdded, onAudioRemoved, audioFile }: AudioUploadZoneProps) => {
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  useEffect(() => {
    if (audioFile) {
      const audio = new Audio(URL.createObjectURL(audioFile));
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
      });
    } else {
      setAudioDuration(null);
    }
  }, [audioFile]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onAudioAdded(acceptedFiles[0]);
    }
  }, [onAudioAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
    },
    multiple: false,
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioFile) {
    return (
      <div className="border-2 border-border rounded-lg p-6 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{audioFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {audioDuration ? `Duration: ${formatDuration(audioDuration)}` : 'Loading...'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onAudioRemoved}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

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
            <p className="text-lg font-medium text-primary">Drop audio here</p>
          </>
        ) : (
          <>
            <Music className="w-12 h-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium text-foreground mb-1">
                Drag & drop audio file here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to select file (MP3)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
