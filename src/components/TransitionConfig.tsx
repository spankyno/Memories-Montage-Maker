import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';

export type TransitionType =
  | 'fade'
  | 'slideLeft'
  | 'slideRight'
  | 'slideUp'
  | 'slideDown'
  | 'zoomIn'
  | 'zoomOut'
  | 'blur'
  | 'circularWipe'
  | 'crossZoom'
  | 'rotate'
  | 'pixelate';

export interface TransitionSettings {
  mode: 'single' | 'multiple';
  singleTransition: TransitionType;
  multipleTransitions: TransitionType[];
  photoDuration: number;
  transitionDuration: number;
}

interface TransitionConfigProps {
  settings: TransitionSettings;
  onChange: (settings: TransitionSettings) => void;
}

export const TRANSITION_OPTIONS: { value: TransitionType; label: string }[] = [
  { value: 'fade', label: 'Fade' },
  { value: 'slideLeft', label: 'Slide Left' },
  { value: 'slideRight', label: 'Slide Right' },
  { value: 'slideUp', label: 'Slide Up' },
  { value: 'slideDown', label: 'Slide Down' },
  { value: 'zoomIn', label: 'Zoom In' },
  { value: 'zoomOut', label: 'Zoom Out' },
  { value: 'blur', label: 'Blur' },
  { value: 'circularWipe', label: 'Circular Wipe' },
  { value: 'crossZoom', label: 'Cross Zoom' },
  { value: 'rotate', label: 'Rotate' },
  { value: 'pixelate', label: 'Pixelate' },
];

export const TransitionConfig = ({ settings, onChange }: TransitionConfigProps) => {
  const toggleTransition = (transition: TransitionType) => {
    const current = settings.multipleTransitions;
    const updated = current.includes(transition)
      ? current.filter(t => t !== transition)
      : [...current, transition];
    onChange({ ...settings, multipleTransitions: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Transition Settings</h3>
        
        <RadioGroup
          value={settings.mode}
          onValueChange={(value) => onChange({ ...settings, mode: value as 'single' | 'multiple' })}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single" id="single" />
            <Label htmlFor="single" className="cursor-pointer">Use one transition for all images</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="multiple" id="multiple" />
            <Label htmlFor="multiple" className="cursor-pointer">Use multiple transitions (random order)</Label>
          </div>
        </RadioGroup>
      </div>

      {settings.mode === 'single' ? (
        <div className="space-y-2">
          <Label htmlFor="transition">Transition Type</Label>
          <Select
            value={settings.singleTransition}
            onValueChange={(value) => onChange({ ...settings, singleTransition: value as TransitionType })}
          >
            <SelectTrigger id="transition">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSITION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-3">
          <Label>Select Transitions (click to toggle)</Label>
          <div className="flex flex-wrap gap-2">
            {TRANSITION_OPTIONS.map((option) => (
              <Badge
                key={option.value}
                variant={settings.multipleTransitions.includes(option.value) ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => toggleTransition(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {settings.multipleTransitions.length} transition{settings.multipleTransitions.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="photoDuration">Photo Duration (seconds)</Label>
          <Input
            id="photoDuration"
            type="number"
            min="0.5"
            max="30"
            step="0.5"
            value={settings.photoDuration}
            onChange={(e) => onChange({ ...settings, photoDuration: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="transitionDuration">Transition Duration (seconds)</Label>
          <Input
            id="transitionDuration"
            type="number"
            min="0.1"
            max="5"
            step="0.1"
            value={settings.transitionDuration}
            onChange={(e) => onChange({ ...settings, transitionDuration: parseFloat(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
};
