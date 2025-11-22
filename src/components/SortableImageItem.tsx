import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { Button } from './ui/button';

interface SortableImageItemProps {
  id: string;
  image: { id: string; file: File; preview: string };
  index: number;
  onRemove: (id: string) => void;
}

export const SortableImageItem = ({ id, image, index, onRemove }: SortableImageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-timeline-item rounded-lg border border-border hover:border-primary/50 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
        {index + 1}
      </div>

      <img
        src={image.preview}
        alt={`Preview ${index + 1}`}
        className="w-16 h-16 object-cover rounded border border-border"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{image.file.name}</p>
        <p className="text-xs text-muted-foreground">
          {(image.file.size / 1024).toFixed(1)} KB
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(id)}
        className="hover:bg-destructive/10 hover:text-destructive shrink-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
