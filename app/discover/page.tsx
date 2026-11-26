"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type DemoProject = {
  id: string; name: string; founder: string; location: string; category: string;
  description: string; ask: string; raised: string; progress: number; initials: string; tone: string;
};

const starterProjects: DemoProject[] = [
  { id: "demo-1", name: "FarmLink Africa", founder: "Amina Njeri", location: "Nakuru, Kenya", category: "Agriculture", description: "Connecting smallholder farmers to reliable buyers, practical market information and better routes to market.", ask: "KES 2.4M", raised: "KES 1.1M", progress: 46, initials: "FA", tone: "sage" },
  { id: "demo-2", name: "Mwangaza Solar", founder: "Brian Otieno", location: "Kisumu, Kenya", category: "Renewable energy", description: "Making dependable solar power more accessible to small businesses and neighbourhood enterprises.", ask: "KES 4.0M", raised: "KES 2.6M", progress: 65, initials: "MS", tone: "sun" },
  { id: "demo-3", name: "AfyaLink", founder: "Grace Achieng", location: "Kampala, Uganda", category: "Healthcare", description: "A digital-first care coordination concept designed to help families find nearby health services.", ask: "USD 35K", raised: "USD 12K", progress: 34, initials: "AL", tone: "blue" },
  { id: "demo-4", name: "Crafted Collective", founder: "Wanjiku Muthoni", location: "Nairobi, Kenya", category: "Creative industries", description: "Helping independent makers bring locally designed products to wider regional and international markets.", ask: "KES 1.8M", raised: "KES 900K", progress: 50, initials: "CC", tone: "rose" },
  { id: "demo-5", name: "RouteWise", founder: "Samuel Kato", location: "Kigali, Rwanda", category: "Logistics", description: "Exploring smarter delivery coordination for growing businesses moving goods across East Africa.", ask: "USD 50K", raised: "USD 18K", progress: 36, initials: "RW", tone: "violet" },
  { id: "demo-6", name: "SkillSpring", founder: "Nadia Hassan", location: "Mombasa, Kenya", category: "Education", description: "A practical skills platform concept connecting young talent with mentors and work-ready learning.", ask: "KES 3.2M", raised: "KES 2.0M", progress: 62, initials: "SS", tone: "mint" },
];

const categories = ["All ideas", "Agriculture", "Technology", "Manufacturing", "Healthcare", "Logistics", "Renewable energy", "Education", "Creative industries"];
const demoActivity = [
  { initials: "AN", name: "Amina Njeri", action: "shared a new idea", detail: "FarmLink Africa · Agriculture", time: "DEMO · 2 hours ago" },
  { initials: "BO", name: "Brian Otieno", action: "updated a project milestone", detail: "Mwangaza Solar · Renewable energy", time: "DEMO · 5 hours ago" },
  { initials: "WM", name: "Wanjiku Muthoni", action: "joined the founder community", detail: "Creative industries · Nairobi", time: "DEMO · Yesterday" },
];

type LiveProject = { id:string; name:string; summary:string; category:string; country_code:string|null; stage:string };

export default function DiscoverPage() {
  const [projects, setProjects] = useState(starterProjects);
  const [liveProjects, setLiveProjects] = useState<LiveProject[]>([]);
  useEffect(() => { const supabase = createClient(); supabase.from("projects").select("id,name,summary,category,country_code,stage").eq("status","published").order("published_at",{ascending:false}).then(({data}) => setLiveProjects((data || []) as LiveProject[])); }, []);
  const [active, setActive] = useState("All ideas");
  const [demoVisible, setDemoVisible] = useState(true);
  const visibleProjects = useMemo(() => projects.filter((project) => active === "All ideas" || project.category === active), [projects, active]);

  function clearDemo() {
    setProjects([]);
    setDemoVisible(false);
  }

  function restoreDemo() {
    setProjects(starterProjects);
    setDemoVisible(true);
  }

  return <main className="shell inner-page">
    <nav className="nav inner-nav">
      <Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link>
      <div className="nav-links"><Link href="/discover">Discover</Link><Link href="/#how-it-works">How it works</Link></div>
      <div className="nav-actions"><Link className="login-link" href="/login">Log in</Link><Link className="button button-small" href="/signup">Join PeersDeck ↗</Link></div>
    </nav>

    <div className="page-intro discover-intro">
      <div className="eyebrow">THE IDEAS DIRECTORY · BUILT IN AFRICA, OPEN TO THE WORLD</div>
      <h1>Discover what<br /><em>could be next.</em></h1>
      <p>Meet the founders, explore emerging ideas and discover the people building tomorrow. Every great enterprise starts somewhere.</p>
      <div className="discover-stats"><span><b>{projects.length}</b> sample projects</span><span><b>{demoVisible ? 3 : 0}</b> sample updates</span><span><b>East Africa</b> demo region</span></div>
    </div>

    <section className="demo-control" aria-label="Demonstration content controls">
      <div><span className="demo-pill">DEMO CONTENT</span><strong>Preview an active PeersDeck community</strong><p>These fictional profiles and projects are for product demonstration only. No real money has been raised.</p></div>
      {demoVisible ? <button className="demo-clear" onClick={clearDemo}>Remove demo data ×</button> : <button className="demo-restore" onClick={restoreDemo}>Restore demo data ↻</button>}
    </section>

    <div className="filter-row">{categories.map((category) => <button type="button" onClick={() => setActive(category)} className={active === category ? "filter active" : "filter"} key={category}>{category}</button>)}</div>

    {visibleProjects.length > 0 ? <section className="demo-project-grid" aria-label="Demonstration projects">
      {visibleProjects.map((project) => <article className="demo-project-card" key={project.id}>
        <div className={`project-art ${project.tone}`}><span className="demo-pill">DEMO PROJECT</span><span className="project-art-mark">{project.initials}</span><span className="project-category">{project.category}</span></div>
        <div className="demo-project-body">
          <div className="project-founder"><span className="founder-avatar">{project.founder.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><b>{project.founder}</b><small>{project.location}</small></span></div>
          <h2>{project.name}</h2><p>{project.description}</p>
          <div className="demo-funding"><div><small>Illustrative progress</small><b>{project.progress}%</b></div><div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div><div className="funding-numbers"><span>{project.raised} <small>sample</small></span><span>Goal {project.ask}</span></div></div>
          <Link className="project-explore" href="/signup">Explore founder opportunities <span>↗</span></Link>
        </div>
      </article>)}
    </section> : <div className="empty-state demo-empty"><div className="empty-symbol">✳</div><h2>{demoVisible ? "No projects in this category yet." : "Demo content has been removed."}</h2><p>{demoVisible ? "Try another industry, or come back as founders publish their ideas." : "The sample profiles and projects have been cleared from this preview. Real founder submissions will appear here after review."}</p>{!demoVisible && <button className="button" onClick={restoreDemo}>Restore demo preview ↻</button>}</div>}

    {liveProjects.length > 0 && <section className="live-project-section"><div className="activity-heading"><div><div className="eyebrow">FOUNDER PROJECTS</div><h2>Projects being<br /><em>built right now.</em></h2></div><p>Public projects shared by PeersDeck members. Details are provided by their founders.</p></div><div className="demo-project-grid">{liveProjects.map(project => <article className="demo-project-card live-project-card" key={project.id}><div className="project-art sage"><span className="demo-pill">FOUNDER PUBLISHED</span><span className="project-art-mark">P</span><span className="project-category">{project.category}</span></div><div className="demo-project-body"><h2>{project.name}</h2><p>{project.summary}</p><div className="funding-numbers"><span>{project.country_code || "Global"}</span><span>{project.stage.replaceAll("_"," ")}</span></div><Link className="project-explore" href={"/projects/"+project.id}>View project <span>↗</span></Link></div></article>)}</div></section>}
    {demoVisible && <section className="demo-activity"><div className="activity-heading"><div><div className="eyebrow">COMMUNITY PULSE · DEMO</div><h2>A little activity goes<br /><em>a long way.</em></h2></div><p>Example updates showing how founder activity may appear as the PeersDeck community grows. These are fictional demonstrations.</p></div><div className="activity-list">{demoActivity.map((item) => <article className="activity-item" key={item.initials}><span className="founder-avatar">{item.initials}</span><div><p><b>{item.name}</b> {item.action}</p><small>{item.detail}</small></div><span className="activity-time">{item.time}</span></article>)}</div></section>}
    <section className="discover-bottom-cta"><div><div className="eyebrow">YOUR IDEA BELONGS HERE</div><h2>Ready to put your idea<br /><em>in front of the world?</em></h2></div><Link className="button" href="/signup">Create your founder profile <span>↗</span></Link></section>
    <footer className="footer inner-footer"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><span>© {new Date().getFullYear()} PeersDeck</span></footer>
  </main>;
}
