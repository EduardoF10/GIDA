export type ProjectListItem = {
  id: number
  title: string
  locationLabel: string
  imageUrl: string | null
}

export default function ProjectItem({ project }: { project: ProjectListItem }) {
  return (
    <article className="projectItem">
      <div className="projectItemMeta">
        <h2 className="projectItemTitle">{project.title}</h2>
        {project.locationLabel ? (
          <p className="projectItemLocation">{project.locationLabel}</p>
        ) : null}
      </div>
      <div className="projectItemMedia">
        {project.imageUrl ? (
          <img
            className="projectItemImage"
            src={project.imageUrl}
            alt={project.title}
            loading="lazy"
          />
        ) : (
          <div className="projectItemImageFallback" aria-hidden />
        )}
      </div>
    </article>
  )
}
