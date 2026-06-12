import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EditModeToggle() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    setIsEditMode(searchParams.get('edit') === 'true');
  }, [searchParams]);

  const toggleEditMode = () => {
    if (isEditMode) {
      setSearchParams({});
    } else {
      setSearchParams({ edit: 'true' });
    }
  };

  if (!isEditMode) return null;

  return (
    <div className="fixed top-20 right-4 z-50">
      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
        <Edit className="h-4 w-4" />
        <span className="font-semibold text-sm">Edit Mode Active</span>
        <Button size="sm" variant="secondary" onClick={toggleEditMode} className="h-7 text-xs">
          <X className="h-3 w-3 mr-1" />
          Exit
        </Button>
      </div>
    </div>
  );
}
