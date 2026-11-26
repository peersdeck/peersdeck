import Link from "next/link";

const highlights = [
  { number: "01", title: "Share your idea", copy: "Turn your vision into a clear, structured project profile that people can understand and support." },
  { number: "02", title: "Build your network", copy: "Meet mentors, collaborators, supporters and potential investors across borders." },
  { number: "03", title: "Find the right opportunity", copy: "Explore projects, discover emerging businesses and follow their progress." },
];

const categories = ["Agriculture", "Technology", "Manufacturing", "Healthcare", "Logistics", "Renewable energy", "Education", "Creative industries"];

export default function Home() {
  return (
    <main>
      <nav className="nav shell">
        <Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link>
        <div className="nav-links"><Link href="/discover">Discover</Link><a href="#how-it-works">How it works</a><a href="#about">About</a></div>
        <div className="nav-actions"><Link className="login-link" href="/login">Log in</Link><Link className="button button-small" href="/signup">Join PeersDeck <span>↗</span></Link></div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> BUILT IN AFRICA. OPEN TO THE WORLD.</div>
          <h1>Big ideas can<br /><em>start anywhere.</em></h1>
          <p className="hero-lede">A place for founders to share what they are building, connect with people who believe in it, and discover pathways to grow.</p>
          <div className="hero-actions"><Link className="button" href="/signup">Bring your idea to life <span>↗</span></Link><Link className="text-link" href="/discover">Explore ideas <span>→</span></Link></div>
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

      <section className="section shell" id="how-it-works">
        <div className="section-heading"><div><div className="eyebrow">A PLATFORM FOR POSSIBILITY</div><h2>Good ideas need<br /><em>the right people.</em></h2></div><p>PeersDeck brings the pieces together: founders with ambition, people with experience, and supporters looking for the next opportunity.</p></div>
        <div className="feature-grid">{highlights.map((item) => <article className="feature" key={item.number}><span className="feature-number">{item.number}</span><div className="feature-arrow">↗</div><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
      </section>

      <section className="category-section"><div className="shell category-inner"><div><div className="eyebrow">ACROSS INDUSTRIES</div><h2>Where ideas<br /><em>meet possibility.</em></h2></div><div className="category-list">{categories.map((category) => <span key={category}>{category}<b>↗</b></span>)}</div></div></section>

      <section className="cta shell" id="about"><div className="cta-panel"><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h2>Every enterprise<br />begins with an idea.</h2><p>Give yours a place to grow.</p><Link className="button button-light" href="/signup">Get started with PeersDeck <span>↗</span></Link><div className="cta-watermark">P</div></div></section>

      <footer className="footer shell"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><span>Built in Africa. Open to the world.</span><span>© {new Date().getFullYear()} PeersDeck</span></footer>
    </main>
  );
}
