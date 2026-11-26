import Link from "next/link";

const categories = ["All ideas", "Agriculture", "Technology", "Manufacturing", "Healthcare", "Logistics", "Energy"];
export default function DiscoverPage() {
  return <main className="shell inner-page">
    <nav className="nav inner-nav"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><div className="nav-links"><Link href="/discover">Discover</Link><Link href="/#how-it-works">How it works</Link></div><div className="nav-actions"><Link className="login-link" href="/login">Log in</Link><Link className="button button-small" href="/signup">Join PeersDeck ↗</Link></div></nav>
    <div className="page-intro"><div className="eyebrow">THE IDEAS DIRECTORY</div><h1>Discover what<br /><em>could be next.</em></h1><p>Explore founder stories and emerging ideas. Connect with the people building tomorrow.</p></div>
    <div className="filter-row">{categories.map((category, i) => <span className={i === 0 ? "filter active" : "filter"} key={category}>{category}</span>)}</div>
    <div className="empty-state"><div className="empty-symbol">✳</div><h2>The discovery space is taking shape.</h2><p>Founder projects will appear here as they are published and reviewed. We will never present sample projects or placeholder figures as real fundraising campaigns.</p><Link className="button" href="/signup">Be among the first founders <span>↗</span></Link></div>
    <footer className="footer inner-footer"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><span>© {new Date().getFullYear()} PeersDeck</span></footer>
  </main>;
}
