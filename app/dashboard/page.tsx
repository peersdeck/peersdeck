import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
 const supabase=await createClient();
 const {data,error}=await supabase.auth.getClaims();
 if(error||!data?.claims)redirect("/login");
 const userId=data.claims.sub as string;
 const email=typeof data.claims.email==="string"?data.claims.email:"Member";
 const [{data:profile},{data:projects}] = await Promise.all([
  supabase.from("profiles").select("full_name,username,headline,bio").eq("id",userId).maybeSingle(),
  supabase.from("projects").select("id,status").eq("owner_id",userId)
 ]);
 const total=projects?.length||0;
 const published=projects?.filter(p=>p.status==="published").length||0;
 async function signOut(){ "use server";const client=await createClient();await client.auth.signOut();redirect("/");}
 return <main className="shell dashboard-page">
 <nav className="nav"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><form action={signOut}><button className="logout-button">Sign out</button></form></nav>
 <section className="dashboard-welcome"><div className="eyebrow">YOUR PEERSDECK SPACE</div><h1>Welcome{profile?.full_name?`, ${profile.full_name.split(" ")[0]}`:""} to your<br/><em>next chapter.</em></h1><p>Signed in as {email}</p></section>
 <div className="dashboard-metrics"><div><b>{total}</b><span>Your projects</span></div><div><b>{published}</b><span>Published publicly</span></div><div><b>{profile?.bio? "Ready":"Start"}</b><span>Founder profile</span></div></div>
 <section className="dashboard-grid">
 <article><span>01 / YOUR PROFILE</span><h2>Tell your story.</h2><p>Add your introduction, professional headline, location, website and profile photo. Your public founder page appears when you publish a project.</p><Link className="button" href="/dashboard/profile">{profile?.full_name?"Edit your profile":"Complete your profile"} <span>↗</span></Link></article>
 <article><span>02 / YOUR IDEAS</span><h2>Make an idea visible.</h2><p>Create project drafts, add your story and publish them to the public PeersDeck discovery directory.</p><Link className="button" href="/dashboard/projects">Open project studio <span>↗</span></Link></article>
 <article><span>03 / YOUR NETWORK</span><h2>Find your people.</h2><p>Public project discovery is open to everyone. Direct messaging, mentor matching and member connections are planned for a later release.</p><Link className="text-link" href="/discover">Explore projects →</Link></article>
 </section>
 <p className="dashboard-disclaimer">PeersDeck currently provides founder profiles and project discovery. It does not process investments, loans, donations or payments.</p>
 </main>;
}