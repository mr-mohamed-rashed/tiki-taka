import { useSearchParams } from 'react-router-dom';

export function useEditMode() {
  const [searchParams] = useSearchParams();
  return searchParams.get('edit') === 'true';
}
