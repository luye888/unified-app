export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category_id?: string;
  category?: Category;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface NoteFormData {
  title: string;
  content: string;
  summary?: string;
  category_id?: string;
  tags: string[];
}
