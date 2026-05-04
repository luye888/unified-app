import { getProjects } from '@/lib/projects'
import { getNotes } from '@/lib/notes'
import Link from 'next/link'

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof getProjects>> = []
  let notes: Awaited<ReturnType<typeof getNotes>> = []

  try {
    const [p, n] = await Promise.all([
      getProjects(),
      getNotes({ publicOnly: true }),
    ])
    projects = p
    notes = n
  } catch {
    // Database may not be set up yet
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">项目</h1>

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">项目展示</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="glass-card p-5">
                <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tech.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 text-sm">
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      在线预览
                    </a>
                  )}
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Public Notes */}
      {notes.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">公开笔记</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <Link key={note.id} href={`/shared/${note.id}`} className="glass-card p-5 block">
                <h3 className="font-semibold line-clamp-1 mb-2">{note.title}</h3>
                {note.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{note.summary}</p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {note.category ? (
                    <span
                      className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                      style={note.category.color ? { backgroundColor: `${note.category.color}20`, color: note.category.color } : undefined}
                    >
                      {note.category.name}
                    </span>
                  ) : <span />}
                  <span>{note.author?.display_name || note.author?.username || '匿名'}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {projects.length === 0 && notes.length === 0 && (
        <p className="text-muted-foreground text-center py-12">暂无项目或笔记</p>
      )}
    </div>
  )
}
