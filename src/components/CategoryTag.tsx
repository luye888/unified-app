'use client';

import { Badge } from '@/components/ui/badge';
import { Category } from '@/types';

interface CategoryTagProps {
  category: Pick<Category, 'id' | 'name'> & Partial<Pick<Category, 'color'>>;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CategoryTag({ category, isSelected, onClick }: CategoryTagProps) {
  return (
    <Badge
      variant={isSelected ? 'default' : 'outline'}
      className="cursor-pointer hover:opacity-80 transition-opacity"
      style={{
        backgroundColor: isSelected ? category.color || '#6b7280' : 'transparent',
        borderColor: category.color || '#6b7280',
        color: isSelected ? 'white' : category.color || '#6b7280',
      }}
      onClick={onClick}
    >
      {category.name}
    </Badge>
  );
}
