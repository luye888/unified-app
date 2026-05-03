export type Profile = {
  id: string
  username: string
  display_name: string | null
  role: 'admin' | 'user'
  bio: string | null
  avatar_url: string | null
  created_at: string
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  content: string
  description: string
  cover: string | null
  tags: string[]
  pinned: boolean
  series: string | null
  author_id: string
  author?: Profile
  published: boolean
  read_time: number
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  title: string
  description: string
  tech: string[]
  url: string | null
  github: string | null
  order: number
  created_at: string
}

export type Category = {
  id: string
  name: string
  description: string | null
  color: string | null
  user_id: string
  created_at: string
}

export type Note = {
  id: string
  title: string
  content: string
  summary: string | null
  tags: string[]
  category_id: string | null
  category?: Category
  author_id: string
  author?: Profile
  is_private: boolean
  created_at: string
  updated_at: string
}

export type NoteFormData = {
  title: string
  content: string
  summary?: string
  category_id?: string
  tags: string[]
  is_private?: boolean
}
