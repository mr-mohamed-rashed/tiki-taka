import { useState } from 'react';
import { Edit, Check, X } from 'lucide-react';
import { useEditMode } from '@/hooks/useEditMode';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function EditableText({ value, onSave, multiline = false, className = '' }: {
  value: string;
  onSave: (newValue: string) => void;
  multiline?: boolean;
  className?: string;
}) {
  const isEditMode = useEditMode();
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const startEdit = () => {
    setEditing(true);
    setTempValue(value);
  };

  const handleSave = () => {
    onSave(tempValue);
    setEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setEditing(false);
  };

  if (!isEditMode) {
    return <span className={className}>{value}</span>;
  }

  if (editing) {
    return (
      <div className="flex items-start gap-2">
        {multiline ? (
          <Textarea
            value={tempValue}
            onChange={e => setTempValue(e.target.value)}
            className="flex-1 min-h-[80px] text-sm"
            autoFocus
          />
        ) : (
          <Input
            value={tempValue}
            onChange={e => setTempValue(e.target.value)}
            className="flex-1 text-sm"
            autoFocus
          />
        )}
        <div className="flex gap-1">
          <Button size="icon" variant="default" className="h-8 w-8" onClick={handleSave}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative inline-block">
      <span className={className}>{value}</span>
      <button
        onClick={startEdit}
        className="absolute -top-1 -right-1 p-1 bg-primary text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit className="h-3 w-3" />
      </button>
    </div>
  );
}
