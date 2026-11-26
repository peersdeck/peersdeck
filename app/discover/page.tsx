"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type DemoProject = {
  id: string;
  name: string;
  founder_name: string;
  location: string;
  category: string;
  description: string;
  cover_image_url: string | null;
  currency: string;
};

type LiveProject = {
  id: string;
  name: string;
  summary: string;
  category: string;
  country_code: string | null;
  location: string | null;
  stage: string;
  funding_goal: number | null;
  currency: string;
  cover_image_url: string | null;
  owner_id: string;
  profiles?: { full_name?: string | null; avatar_url?: string | null; headline?: string | null } | null;
};

function safeImageUrl(value: string | null | undefined) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function initials(value: string) {
  return value.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

const fallbackTones = ["sage", "sun", "blue", "rose", "violet", "mint"];

export default function DiscoverPage() {
  const [demoProjects, setDemoProjects] = useState<DemoProject[]>([]);
  const [liveProjects, setLiveProjects] = useState<LiveProject[]>([]);
  const [activeCategory, setActiveCategory] = useState("All ideas");
  const [search, setSearch] = useState("");
  const [showDemo, setShowDemo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    async function loadDirectory() {
      setLoading(true);
      setLoadError("");
      const [demoResult, liveResult] = await Promise.all([
        supabase.from("demo_projects").select("id,name,founder_name,location,category,description,cover_image_url,currency").eq("is_active", true).order("display_order", { ascending: true }),
        supabase.from("projects").select("id,name,summary,category,country_code,location,stage,funding_goal,amount_raised,funding_deadline,currency,cover_image_url,owner_id").eq("status", "published").eq("is_demo", false).order("published_at", { ascending: false }),
      ]);
      if (!mounted) return;
      const ownerIds = Array.from(new Set((liveResult.data || []).map((project) => project.owner_id)));
      const profileResult = ownerIds.length
        ? await supabase.from("profiles").select("id,full_name,avatar_url,headline").in("id", ownerIds)
        : { data: [], error: null };
      if (!mounted) return;
      if (demoResult.error || liveResult.error || profileResult.error) {
        setLoadError("Some project information could not be loaded. Please refresh the page.");
      }
      const profilesById = new Map((profileResult.data || []).map((profile) => [profile.id, profile]));
      const projectsWithProfiles = (liveResult.data || []).map((project) => ({
        ...project,
        profiles: profilesById.get(project.owner_id) || null,
      }));
      setDemoProjects((demoResult.data || []) as DemoProject[]);
      setLiveProjects(projectsWithProfiles as unknown as LiveProject[]);
      setLoading(false);
    }
    void loadDirectory();
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(() => {
    const all = [...(showDemo ? demoProjects : []), ...liveProjects];
    return ["All ideas", ...Array.from(new Set(all.map((project) => project.category).filter(Boolean))).sort((a, b) => a.localeCompare(b))];
  }, [demoProjects, liveProjects, showDemo]);

  const filteredDemo = useMemo(() => demoProjects.filter((project) => {
    const categoryMatch = activeCategory === "All ideas" || project.category === activeCategory;
    const term = search.trim().toLowerCase();
    const searchMatch = !term || [project.name, project.founder_name, project.location, project.category, project.description].join(" ").toLowerCase().includes(term);
    return showDemo && categoryMatch && searchMatch;
  }), [demoProjects, activeCategory, search, showDemo]);

  const filteredLive = useMemo(() => liveProjects.filter((project) => {
    const categoryMatch = activeCategory === "All ideas" || project.category === activeCategory;
    const term = search.trim().toLowerCase();
    const founder = project.profiles?.full_name || "";
    const searchMatch = !term || [project.name, founder, project.location || "", project.country_code || "", project.category, project.summary].join(" ").toLowerCase().includes(term);
    return categoryMatch && searchMatch;
  }), [liveProjects, activeCategory, search]);

  useEffect(() => {
    if (activeCategory !== "All ideas" && !categories.includes(activeCategory)) setActiveCategory("All ideas");
  }, [categories, activeCategory]);

  const totalCount = filteredDemo.length + filteredLive.length;

  return <main className="shell inner-page">
    <nav className="nav inner-nav">
      <Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link>
      <div className="nav-links"><Link href="/discover">Discover</Link><Link href="/#how-it-works">How it works</Link></div>
      <div className="nav-actions"><Link className="login-link" href="/login">Log in</Link><Link className="button button-small" href="/signup">Join PeersDeck ↗</Link></div>
    </nav>

    <div className="page-intro discover-intro">
      <div className="eyebrow">THE IDEAS DIRECTORY · BUILT IN AFRICA, OPEN TO THE WORLD</div>
      <h1>Discover what<br /><em>could be next.</em></h1>
      <p>Explore founder-published projects, meet the people behind them and discover ideas from around the world.</p>
      <div className="discover-stats">
        <span><b>{loading ? "—" : liveProjects.length}</b> published projects</span>
        <span><b>{loading ? "—" : (showDemo ? demoProjects.length : 0)}</b> illustrative demos</span>
        <span><b>{loading ? "—" : categories.length - 1}</b> industries</span>
      </div>
    </div>

    <section className="demo-control" aria-label="Directory information">
      <div><span className="demo-pill">LIVE DIRECTORY</span><strong>Projects update from the PeersDeck database</strong><p>Founder-published projects are shown separately from fictional examples. Sample projects are illustrative only and do not represent real founders, fundraising or transactions.</p></div>
      <button className={showDemo ? "demo-clear" : "demo-restore"} onClick={() => setShowDemo((value) => !value)}>{showDemo ? "Hide demo examples ×" : "Show demo examples ↻"}</button>
    </section>

    <div className="directory-search">
      <input aria-label="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects, founders, industries or locations..." />
      <span>{loading ? "Loading…" : `${totalCount} results`}</span>
    </div>

    <div className="filter-row">{categories.map((category) => <button type="button" onClick={() => setActiveCategory(category)} className={activeCategory === category ? "filter active" : "filter"} key={category}>{category}</button>)}</div>

    {loadError && <p className="directory-error" role="status">{loadError}</p>}
    {loading ? <div className="directory-loading">Loading projects from PeersDeck…</div> : <>
      {filteredLive.length > 0 && <section className="live-project-section"><div className="activity-heading"><div><div className="eyebrow">FOUNDER PROJECTS</div><h2>Projects being<br /><em>built right now.</em></h2></div><p>Projects published by PeersDeck members. Details are provided by their founders.</p></div><div className="demo-project-grid">{filteredLive.map((project) => {
        const image = safeImageUrl(project.cover_image_url);
        const founder = project.profiles?.full_name || "PeersDeck founder";
        return <article className="demo-project-card live-project-card" key={project.id}>
          <div className={`project-art project-placeholder ${fallbackTones[0]}`} style={image ? { backgroundImage: `linear-gradient(180deg, #17251b22, #17251b66), url("${image}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
            <span className="placeholder-topline"><span className="demo-pill">FOUNDER PUBLISHED</span><span className="placeholder-image-icon">✳</span></span>
            {!image && <><span className="placeholder-orb placeholder-orb-one" /><span className="placeholder-orb placeholder-orb-two" /><span className="project-art-mark">{initials(project.name)}</span><span className="placeholder-caption">FOUNDER COVER IMAGE</span></>}
            <span className="project-category">{project.category}</span>
          </div>
          <div className="demo-project-body"><div className="project-founder"><span className="founder-avatar">{initials(founder)}</span><span><b>{founder}</b><small>{project.location || project.country_code || "Location not provided"}</small></span><span className="founder-label">FOUNDER</span></div><h2>{project.name}</h2><p>{project.summary}</p><div className="funding-numbers"><span>Raised: {project.currency || "USD"} {Number(project.amount_raised || 0).toLocaleString()}</span><span>Target: {project.funding_goal != null ? `${project.currency || "USD"} ${Number(project.funding_goal).toLocaleString()}` : "Not stated"}</span></div><div className="funding-numbers"><span>Balance: {project.funding_goal != null ? `${project.currency || "USD"} ${Math.max(0,Number(project.funding_goal)-Number(project.amount_raised||0)).toLocaleString()}` : "—"}</span><span>{project.funding_deadline ? (Math.ceil((new Date(project.funding_deadline+"T23:59:59Z").getTime()-Date.now())/86400000)<0 ? "Deadline passed" : Math.ceil((new Date(project.funding_deadline+"T23:59:59Z").getTime()-Date.now())/86400000)+" days left") : project.stage.replaceAll("_", " ")}</span></div><Link className="project-explore" href={`/projects/${project.id}`}>View project <span>↗</span></Link></div>
        </article>;
      })}</div></section>}

      {showDemo && filteredDemo.length > 0 && <section className="demo-project-section"><div className="activity-heading"><div><div className="eyebrow">ILLUSTRATIVE EXAMPLES</div><h2>Explore the<br /><em>possibilities.</em></h2></div><p>These sample profiles demonstrate how founder projects can appear. They are not real businesses or fundraising campaigns.</p></div><div className="demo-project-grid">{filteredDemo.map((project, index) => {
        const image = safeImageUrl(project.cover_image_url);
        return <article className="demo-project-card" key={project.id}>
          <div className={`project-art project-placeholder ${fallbackTones[index % fallbackTones.length]}`} style={image ? { backgroundImage: `linear-gradient(180deg, #17251b22, #17251b66), url("${image}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
            <span className="placeholder-topline"><span className="demo-pill">DEMO PREVIEW</span><span className="placeholder-image-icon">✳</span></span>
            {!image && <><span className="placeholder-orb placeholder-orb-one" /><span className="placeholder-orb placeholder-orb-two" /><span className="project-art-mark">{initials(project.name)}</span><span className="placeholder-caption">ILLUSTRATIVE COVER</span></>}
            <span className="project-category">{project.category}</span>
          </div>
          <div className="demo-project-body"><div className="project-founder"><span className="founder-avatar">{initials(project.founder_name)}</span><span><b>{project.founder_name}</b><small>{project.location}</small></span><span className="founder-label">SAMPLE</span></div><h2>{project.name}</h2><p>{project.description}</p><div className="project-explore"><span>Illustrative project profile</span><span>DEMO</span></div></div>
        </article>;
      })}</div></section>}

      {totalCount === 0 && <div className="empty-state demo-empty"><div className="empty-symbol">✳</div><h2>No matching projects yet.</h2><p>Try a different search or industry. Founders can publish projects to make them discoverable here.</p><Link className="button" href="/signup">Join PeersDeck ↗</Link></div>}
    </>}

    <section className="discover-bottom-cta"><div><div className="eyebrow">YOUR IDEA BELONGS HERE</div><h2>Ready to put your idea<br /><em>in front of the world?</em></h2></div><Link className="button" href="/signup">Create your founder profile <span>↗</span></Link></section>
    <footer className="footer inner-footer"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><span>© {new Date().getFullYear()} PeersDeck</span></footer>
  </main>;
}
