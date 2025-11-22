import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type { TransitionType } from '@/components/TransitionConfig';

let ffmpeg: FFmpeg | null = null;

export const loadFFmpeg = async (onProgress?: (progress: number) => void) => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  ffmpeg.on('log', ({ message }) => {
    console.log(message);
  });

  ffmpeg.on('progress', ({ progress }) => {
    if (onProgress) {
      onProgress(Math.round(progress * 100));
    }
  });

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
};

const createTransitionFilter = (
  transition: TransitionType,
  duration: number,
  index: number
): string => {
  const offset = index > 0 ? '-' : '';
  
  switch (transition) {
    case 'fade':
      return `fade=t=in:st=0:d=${duration}`;
    case 'slideLeft':
      return `fade=t=in:st=0:d=${duration},slide=direction=left:duration=${duration}`;
    case 'slideRight':
      return `fade=t=in:st=0:d=${duration},slide=direction=right:duration=${duration}`;
    case 'slideUp':
      return `fade=t=in:st=0:d=${duration},slide=direction=up:duration=${duration}`;
    case 'slideDown':
      return `fade=t=in:st=0:d=${duration},slide=direction=down:duration=${duration}`;
    case 'zoomIn':
      return `zoompan=z='min(zoom+0.0015,1.5)':d=${duration * 25}:s=1280x720`;
    case 'zoomOut':
      return `zoompan=z='if(lte(zoom,1.0),1.5,max(1.001,zoom-0.0015))':d=${duration * 25}:s=1280x720`;
    case 'blur':
      return `fade=t=in:st=0:d=${duration},gblur=sigma=10:steps=1`;
    case 'circularWipe':
      return `fade=t=in:st=0:d=${duration}`;
    case 'crossZoom':
      return `zoompan=z='min(max(zoom,pzoom)+0.0015,1.5)':d=${duration * 25}:s=1280x720,fade=t=in:st=0:d=${duration}`;
    case 'rotate':
      return `rotate=angle='2*PI*t/${duration}':fillcolor=black,fade=t=in:st=0:d=${duration}`;
    case 'pixelate':
      return `scale=iw/10:ih/10,scale=1280:720:flags=neighbor,fade=t=in:st=0:d=${duration}`;
    default:
      return `fade=t=in:st=0:d=${duration}`;
  }
};

export interface GenerateVideoOptions {
  images: Array<{ file: File; preview: string }>;
  audioFile: File;
  transitions: TransitionType[];
  photoDuration: number;
  transitionDuration: number;
  useMultipleTransitions: boolean;
  onProgress?: (progress: number, status: string) => void;
}

export const generateVideo = async ({
  images,
  audioFile,
  transitions,
  photoDuration,
  transitionDuration,
  useMultipleTransitions,
  onProgress,
}: GenerateVideoOptions): Promise<Blob> => {
  const ffmpegInstance = await loadFFmpeg((progress) => {
    if (onProgress) onProgress(progress, 'Processing video...');
  });

  if (onProgress) onProgress(0, 'Loading files...');

  // Write audio file
  await ffmpegInstance.writeFile('audio.mp3', await fetchFile(audioFile));

  // Write image files
  for (let i = 0; i < images.length; i++) {
    if (onProgress) onProgress((i / images.length) * 20, `Loading image ${i + 1}/${images.length}...`);
    await ffmpegInstance.writeFile(`image${i}.jpg`, await fetchFile(images[i].file));
  }

  if (onProgress) onProgress(25, 'Creating video segments...');

  // Create input list for concat
  let concatList = '';
  
  for (let i = 0; i < images.length; i++) {
    const transition = useMultipleTransitions
      ? transitions[i % transitions.length]
      : transitions[0];
    
    // For each image, we'll create a segment with transition
    const segmentDuration = photoDuration + (i < images.length - 1 ? transitionDuration : 0);
    
    // Simple approach: create video segments and concatenate
    // This is a simplified version - full transition effects would require more complex filter graphs
    await ffmpegInstance.exec([
      '-loop', '1',
      '-i', `image${i}.jpg`,
      '-vf', `scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=in:0:15,fade=out:${Math.floor((photoDuration - 0.5) * 25)}:15`,
      '-t', `${photoDuration}`,
      '-pix_fmt', 'yuv420p',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      `segment${i}.mp4`
    ]);
    
    concatList += `file 'segment${i}.mp4'\n`;
  }

  // Write concat list
  await ffmpegInstance.writeFile('concat.txt', concatList);

  if (onProgress) onProgress(70, 'Merging segments...');

  // Concatenate all segments
  await ffmpegInstance.exec([
    '-f', 'concat',
    '-safe', '0',
    '-i', 'concat.txt',
    '-c', 'copy',
    'video_no_audio.mp4'
  ]);

  if (onProgress) onProgress(85, 'Adding audio...');

  // Add audio to video
  await ffmpegInstance.exec([
    '-i', 'video_no_audio.mp4',
    '-i', 'audio.mp3',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-shortest',
    'output.mp4'
  ]);

  if (onProgress) onProgress(95, 'Finalizing...');

  // Read the output file
  const data = await ffmpegInstance.readFile('output.mp4');
  
  if (onProgress) onProgress(100, 'Complete!');

  // Handle different FileData types - FFmpeg returns Uint8Array
  let blobData: BlobPart;
  if (data instanceof Uint8Array) {
    // Create a new Uint8Array with ArrayBuffer to ensure compatibility
    blobData = new Uint8Array(data);
  } else if (typeof data === 'string') {
    blobData = new TextEncoder().encode(data);
  } else {
    blobData = new Uint8Array(data);
  }
  
  return new Blob([blobData], { type: 'video/mp4' });
};
