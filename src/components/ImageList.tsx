import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableImageItem } from './SortableImageItem';

interface ImageListProps {
  images: Array<{ id: string; file: File; preview: string }>;
  onReorder: (images: Array<{ id: string; file: File; preview: string }>) => void;
  onRemove: (id: string) => void;
}

export const ImageList = ({ images, onReorder, onRemove }: ImageListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      onReorder(arrayMove(images, oldIndex, newIndex));
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Images Timeline</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map(img => img.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {images.map((image, index) => (
              <SortableImageItem
                key={image.id}
                id={image.id}
                image={image}
                index={index}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
