import { useState } from 'react';
import { Edit, Check, X } from 'lucide-react';
import { useEditMode } from '@/hooks/useEditMode';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function EditableImage({ src, alt, onSave, className = '' }: {
  src: string;
  alt?: string;
  onSave: (newSrc: string) => void;
  className?: string;
}) {
  const isEditMode = useEditMode();
  const [editing, setEditing] = useState(false);
  const [tempSrc, setTempSrc] = useState(src);

  const startEdit = () => {
    setEditing(true);
    setTempSrc(src);
  };

  const handleSave = () => {
    onSave(tempSrc);
    setEditing(false);
  };

  const handleCancel = () => {
    setTempSrc(src);
    setEditing(false);
  };

  if (!isEditMode) {
    return <img src={src} alt={alt} className={className} />;
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <Input
          value={tempSrc}
          onChange={e => setTempSrc(e.target.value)}
          placeholder="Image URL"
          className="text-sm"
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="gap-1.5">
            <Check className="h-3 w-3" /> Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
        </div>
        {tempSrc && (
          <img src={tempSrc} alt={alt} className={className} style={{ maxHeight: '200px' }} />
        )}
      </div>
    );
  }

  return (
    <div className="group relative inline-block">
      <img src={src} alt={alt} className={className} />
      <button
        onClick={startEdit}
        className="absolute top-2 right-2 p-1.5 bg-primary text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit className="h-3 w-3" />
      </button>
    </div>
  );
}
