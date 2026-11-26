import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const highlights = [
  { number: "01", title: "Share your idea", copy: "Turn your vision into a clear, structured project profile that people can understand and support." },
  { number: "02", title: "Build your network", copy: "Meet mentors, collaborators, supporters and potential investors across borders." },
  { number: "03", title: "Find the right opportunity", copy: "Explore projects, discover emerging businesses and follow their progress." },
];

function safeImage(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const supabase = await createClient();
  const [projectsResult, demoResult, analyticsResult] = await Promise.all([
    supabase.from("projects").select("id,name,summary,category,country_code,location,cover_image_url").eq("status", "published").eq("is_demo", false).order("published_at", { ascending: false }).limit(3),
    supabase.from("demo_projects").select("category").eq("is_active", true),
    supabase.from("projects").select("owner_id,country_code,category,funding_goal,amount_raised,currency").eq("status", "published").eq("is_demo", false),
  ]);
  const featuredProjects = projectsResult.data || [];
  const liveAnalytics = analyticsResult.data || [];
  const uniqueFounders = new Set(liveAnalytics.map((project) => project.owner_id).filter(Boolean)).size;
  const uniqueCountries = new Set(liveAnalytics.map((project) => project.country_code).filter(Boolean)).size;
  const uniqueIndustries = new Set(liveAnalytics.map((project) => project.category).filter(Boolean)).size;
  const moneyByCurrency = (field: "funding_goal" | "amount_raised") => {
    const totals = new Map<string, number>();
    for (const project of liveAnalytics) {
      const currency = project.currency || "USD";
      const amount = Number(project[field] || 0);
      if (Number.isFinite(amount)) totals.set(currency, (totals.get(currency) || 0) + amount);
    }
    return Array.from(totals.entries()).filter(([, amount]) => amount > 0).sort(([a], [b]) => a.localeCompare(b));
  };
  const formatTotals = (totals: [string, number][]) => totals.length
    ? totals.map(([currency, amount]) => `${currency} ${new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(amount)}`).join(" · ")
    : "No published figures yet";
  const categories = Array.from(new Set([
    ...(projectsResult.data || []).map((project) => project.category),
    ...(demoResult.data || []).map((project) => project.category),
  ].filter(Boolean))).sort((a, b) => a.localeCompare(b));

  return (
    <main>
      <nav className="nav shell">
        <Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link>
        <div className="nav-links"><Link className="nav-discover" href="/discover">Discover projects <span>↗</span></Link><a href="#how-it-works">How it works</a><a href="#about">About</a></div>
        <div className="nav-actions"><Link className="login-link" href="/login">Log in</Link><Link className="button button-small" href="/signup">Join PeersDeck <span>↗</span></Link></div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> BUILT IN AFRICA. OPEN TO THE WORLD.</div>
          <h1>Big ideas can<br /><em>start anywhere.</em></h1>
          <p className="hero-lede">A place for founders to share what they are building, connect with people who believe in it, and discover pathways to grow.</p>
          <div className="hero-actions"><Link className="button" href="/signup">Bring your idea to life <span>↗</span></Link><Link className="text-link" href="/discover">Browse projects — no account needed <span>→</span></Link></div>
          <div className="hero-note"><span className="note-icon">✳</span><span>From an idea to an opportunity.<br />From an opportunity to an enterprise.</span></div>
        </div>
        <div className="hero-art" aria-label="Illustration representing ideas connecting into opportunities">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="art-glow" />
          <div className="art-card card-top"><span className="mini-icon">✳</span><span>IDEAS</span><b>Start with a spark.</b></div>
          <div className="art-center"><div className="center-symbol">P</div><span>PEERSDECK</span><small>Possibility, connected.</small></div>
          <div className="art-card card-bottom"><span className="mini-icon">↗</span><span>OPPORTUNITY</span><b>Build what comes next.</b></div>
          <div className="art-dot dot-one" /><div className="art-dot dot-two" /><div className="art-dot dot-three" />
        </div>
      </section>

      <section className="ticker"><div className="shell ticker-inner"><span>IDEAS</span><i>✳</i><span>PEOPLE</span><i>✳</i><span>CAPITAL</span><i>✳</i><span>PROGRESS</span><i>✳</i><span>IMPACT</span></div></section>

      <section className="global-impact shell" aria-labelledby="global-impact-title">
        <div className="impact-heading"><div><div className="eyebrow">THE PEERSDECK COMMUNITY · GLOBAL OVERVIEW</div><h2 id="global-impact-title">Ideas in motion.<br /><em>Impact taking shape.</em></h2></div><span className="impact-live"><i /> LIVE PLATFORM DATA</span></div>
        <div className="impact-grid">
          <article className="impact-card impact-primary"><span>Published projects</span><strong>{analyticsResult.data ? liveAnalytics.length.toLocaleString() : "—"}</strong><small>Founder projects approved and visible in Discover</small></article>
          <article className="impact-card"><span>Founders represented</span><strong>{analyticsResult.data ? uniqueFounders.toLocaleString() : "—"}</strong><small>Distinct project owners</small></article>
          <article className="impact-card"><span>Countries represented</span><strong>{analyticsResult.data ? uniqueCountries.toLocaleString() : "—"}</strong><small>Based on project country records</small></article>
          <article className="impact-card"><span>Industries represented</span><strong>{analyticsResult.data ? uniqueIndustries.toLocaleString() : "—"}</strong><small>Distinct project classifications</small></article>
        </div>
        <div className="impact-finance-grid">
          <div className="impact-finance"><span className="impact-finance-label">Funding sought · published projects</span><strong>{analyticsResult.data ? formatTotals(moneyByCurrency("funding_goal")) : "—"}</strong><small>Targets shown separately by currency; no exchange-rate conversion is assumed.</small></div>
          <div className="impact-finance"><span className="impact-finance-label">Founder-reported amount raised</span><strong>{analyticsResult.data ? formatTotals(moneyByCurrency("amount_raised")) : "—"}</strong><small>Figures entered by founders; not independently verified payments.</small></div>
        </div>
        <p className="impact-footnote">Live totals exclude fictional demonstration projects and unpublished drafts. Project statistics update from published PeersDeck records.</p>
      </section>

      <section className="section shell" id="how-it-works">
        <div className="section-heading"><div><div className="eyebrow">A PLATFORM FOR POSSIBILITY</div><h2>Good ideas need<br /><em>the right people.</em></h2></div><p>PeersDeck brings the pieces together: founders with ambition, people with experience, and supporters looking for the next opportunity.</p></div>
        <div className="feature-grid">{highlights.map((item) => <article className="feature" key={item.number}><span className="feature-number">{item.number}</span><div className="feature-arrow">↗</div><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
      </section>

      <section className="category-section"><div className="shell category-inner"><div><div className="eyebrow">ACROSS INDUSTRIES · {categories.length} CATEGORIES</div><h2>Where ideas<br /><em>meet possibility.</em></h2></div><div className="category-list">{categories.length ? categories.map((category) => <Link href="/discover" key={category}>{category}<b>↗</b></Link>) : <span>Categories will appear as projects are added.</span>}</div></div></section>

      {featuredProjects.length > 0 && <section className="section shell homepage-featured"><div className="section-heading"><div><div className="eyebrow">LATEST FOUNDER PROJECTS</div><h2>Fresh ideas,<br /><em>from the community.</em></h2></div><Link className="text-link" href="/discover">Explore all projects →</Link></div><div className="homepage-project-grid">{featuredProjects.map((project) => { const image = safeImage(project.cover_image_url); return <Link className="homepage-project-card" href={`/projects/${project.id}`} key={project.id}><div className="homepage-project-image" style={image ? { backgroundImage: `linear-gradient(180deg,#17251b08,#17251b22),url("${image}")` } : undefined}><span>{project.category}</span></div><div><h3>{project.name}</h3><p>{project.summary}</p><small>{project.location || project.country_code || "Global"} · View project ↗</small></div></Link>; })}</div></section>}

      <section className="public-discover shell" aria-labelledby="public-discover-title">
        <div className="public-discover-copy"><div className="eyebrow">OPEN TO EVERYONE · NO SIGN-IN REQUIRED</div><h2 id="public-discover-title">Find a project<br /><em>worth believing in.</em></h2><p>Browse founder stories, explore business ideas and discover emerging projects across industries. Visitors can look around freely before deciding to join PeersDeck.</p><Link className="button" href="/discover">Discover projects <span>↗</span></Link></div>
        <div className="public-discover-visual"><div className="discover-visual-orbit"></div><div className="discover-visual-card visual-one"><span>01 / AGRICULTURE</span><b>Ideas that grow</b><small>Explore founder-led ventures</small></div><div className="discover-visual-card visual-two"><span>02 / CLEAN ENERGY</span><b>Powering possibility</b><small>Discover new approaches</small></div><div className="discover-visual-card visual-three"><span>03 / LOGISTICS</span><b>Connecting markets</b><small>See what's being built</small></div><div className="discover-visual-center">P</div></div>
      </section>

      <section className="cta shell" id="about"><div className="cta-panel"><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h2>Every enterprise<br />begins with an idea.</h2><p>Give yours a place to grow.</p><Link className="button button-light" href="/signup">Get started with PeersDeck <span>↗</span></Link><div className="cta-watermark">P</div></div></section>

      <footer className="footer shell"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><span>Built in Africa. Open to the world.</span><span>© {new Date().getFullYear()} PeersDeck</span></footer>
    </main>
  );
}
