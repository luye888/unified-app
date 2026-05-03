'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Note } from '@/types';

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const formattedDate = new Date(note.updated_at).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
            {note.category && (
              <Badge
                variant="secondary"
                style={{ backgroundColor: note.category.color || '#6b7280' }}
                className="text-white text-xs"
              >
                {note.category.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {note.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {note.summary}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formattedDate}</span>
            {note.tags.length > 0 && (
              <div className="flex gap-1">
                {note.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {note.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{note.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
