import { supabase } from './supabase'
import { Project } from '@/types'

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('order', { ascending: false })

  if (error) throw error
  return data as Project[]
}

export async function createProject(project: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function updateProject(id: string, project: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update(project)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}
