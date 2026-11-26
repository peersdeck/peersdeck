import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/login");

  const email = typeof data.claims.email === "string" ? data.claims.email : "Member";

  async function signOut() {
    "use server";
    const client = await createClient();
    await client.auth.signOut();
    redirect("/");
  }

  return <main className="shell dashboard-page">
    <nav className="nav"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><form action={signOut}><button className="logout-button">Sign out</button></form></nav>
    <section className="dashboard-welcome"><div className="eyebrow">YOUR PEERSDECK SPACE</div><h1>Welcome to your<br /><em>next chapter.</em></h1><p>Signed in as {email}</p></section>
    <div className="dashboard-shortcuts"><Link className="button" href="/dashboard/projects">Open project studio <span>↗</span></Link></div>
    <section className="dashboard-grid">
      <article><span>01 / YOUR PROFILE</span><h2>Tell your story.</h2><p>Your founder or member profile will help others understand who you are and what you are working towards.</p><b>Profile tools are coming next.</b></article>
      <article><span>02 / YOUR IDEAS</span><h2>Make an idea visible.</h2><p>Prepare a project profile with its problem, solution, market, team, milestones and funding needs.</p><b>Project publishing is not enabled yet.</b></article>
      <article><span>03 / YOUR NETWORK</span><h2>Find your people.</h2><p>Connect with mentors, collaborators, supporters and other founders.</p><b>Networking tools are coming next.</b></article>
    </section>
    <p className="dashboard-disclaimer">PeersDeck is under active development. No fundraising, investment or payment transactions are currently enabled.</p>
  </main>;
}
