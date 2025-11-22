import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageUploadZone } from '@/components/ImageUploadZone';
import { AudioUploadZone } from '@/components/AudioUploadZone';
import { ImageList } from '@/components/ImageList';
import { TransitionConfig, TransitionSettings, TRANSITION_OPTIONS } from '@/components/TransitionConfig';
import { Film, Clock, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateVideo } from '@/utils/videoGenerator';
import { Progress } from '@/components/ui/progress';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

const Index = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [transitionSettings, setTransitionSettings] = useState<TransitionSettings>({
    mode: 'single',
    singleTransition: 'fade',
    multipleTransitions: ['fade', 'slideLeft', 'zoomIn'],
    photoDuration: 3,
    transitionDuration: 1,
  });

  const handleImagesAdded = (files: File[]) => {
    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
    toast.success(`Added ${files.length} image${files.length > 1 ? 's' : ''}`);
  };

  const handleImageReorder = (reorderedImages: ImageItem[]) => {
    setImages(reorderedImages);
  };

  const handleImageRemove = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
    toast.success('Image removed');
  };

  const handleAudioAdded = (file: File) => {
    setAudioFile(file);
    toast.success('Audio file added');
  };

  const handleAudioRemoved = () => {
    setAudioFile(null);
    toast.success('Audio file removed');
  };

  const calculateEstimatedDuration = () => {
    if (images.length === 0) return 0;
    const totalPhotoDuration = images.length * transitionSettings.photoDuration;
    const totalTransitionDuration = (images.length - 1) * transitionSettings.transitionDuration;
    return totalPhotoDuration + totalTransitionDuration;
  };

  const handleGenerateVideo = async () => {
    if (images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }
    if (!audioFile) {
      toast.error('Please add an audio file');
      return;
    }

    const transitions = transitionSettings.mode === 'single'
      ? [transitionSettings.singleTransition]
      : transitionSettings.multipleTransitions;

    if (transitions.length === 0) {
      toast.error('Please select at least one transition');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setProgressStatus('Starting...');

    try {
      const videoBlob = await generateVideo({
        images,
        audioFile,
        transitions,
        photoDuration: transitionSettings.photoDuration,
        transitionDuration: transitionSettings.transitionDuration,
        useMultipleTransitions: transitionSettings.mode === 'multiple',
        onProgress: (prog, status) => {
          setProgress(prog);
          setProgressStatus(status);
        },
      });

      // Download the video
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `memory-images-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Video generated successfully!');
    } catch (error) {
      console.error('Error generating video:', error);
      toast.error('Failed to generate video. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setProgressStatus('');
    }
  };

  const estimatedDuration = calculateEstimatedDuration();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Film className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Memory Images</h1>
                <p className="text-sm text-muted-foreground">by Aitor Sánchez</p>
              </div>
            </div>
            {images.length > 0 && audioFile && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    ~{Math.floor(estimatedDuration / 60)}:{String(Math.floor(estimatedDuration % 60)).padStart(2, '0')}
                  </span>
                </div>
                <Button
                  onClick={handleGenerateVideo}
                  disabled={isGenerating}
                  size="lg"
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Generate Video
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isGenerating && (
          <Card className="mb-8 p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{progressStatus}</p>
                <p className="text-sm text-muted-foreground">{progress}%</p>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Images</h2>
              <ImageUploadZone onImagesAdded={handleImagesAdded} imageCount={images.length} />
            </Card>

            {images.length > 0 && (
              <Card className="p-6">
                <ImageList images={images} onReorder={handleImageReorder} onRemove={handleImageRemove} />
              </Card>
            )}
          </div>

          {/* Right Column - Audio & Settings */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Audio</h2>
              <AudioUploadZone
                onAudioAdded={handleAudioAdded}
                onAudioRemoved={handleAudioRemoved}
                audioFile={audioFile}
              />
            </Card>

            <Card className="p-6">
              <TransitionConfig settings={transitionSettings} onChange={setTransitionSettings} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
