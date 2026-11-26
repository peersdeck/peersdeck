import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Project = {
  id: string;
  name: string;
  category: string;
  stage: string;
  status: string;
  updated_at: string;
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims) redirect("/login");
  const userId = claimsData.claims.sub;
  const { data: projects } = await supabase.from("projects").select("id,name,category,stage,status,updated_at").eq("owner_id", userId).order("updated_at", { ascending: false });

  return <main className="shell dashboard-page">
    <nav className="nav"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><Link className="logout-button" href="/dashboard">Back to dashboard</Link></nav>
    <section className="dashboard-welcome"><div className="eyebrow">FOUNDER WORKSPACE</div><h1>Your project<br /><em>studio.</em></h1><p>Manage your ideas and prepare them for review.</p><Link className="button" href="/dashboard/projects/new">Create a project <span>↗</span></Link></section>
    <section className="project-list">
      {!projects?.length ? <div className="empty-projects"><div className="empty-symbol">✳</div><h2>Your first idea starts here.</h2><p>Create a project draft. You can return to complete it whenever you're ready.</p><Link className="button" href="/dashboard/projects/new">Start a project <span>↗</span></Link></div> :
        projects.map((project: Project) => <article className="project-row" key={project.id}><div><span>{project.category} · {project.stage.replaceAll("_"," ")}</span><h2>{project.name}</h2><small>Last updated {new Date(project.updated_at).toLocaleDateString()}</small></div><b>{project.status}</b></article>)}
    </section>
    <p className="dashboard-disclaimer">All projects are private drafts at this stage. Public publishing and fundraising are not enabled yet.</p>
  </main>;
}
