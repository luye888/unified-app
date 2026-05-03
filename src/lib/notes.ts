import { supabase } from './supabase';
import { Note, NoteFormData } from '@/types';

export async function getNotes(search?: string, categoryId?: string) {
  let query = supabase
    .from('notes')
    .select('*, category:categories(*)')
    .order('updated_at', { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Note[];
}

export async function getNote(id: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Note;
}

export async function createNote(note: NoteFormData) {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single();

  if (error) throw error;
  return data as Note;
}

export async function updateNote(id: string, note: Partial<NoteFormData>) {
  const { data, error } = await supabase
    .from('notes')
    .update({ ...note, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Note;
}

export async function deleteNote(id: string) {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}
