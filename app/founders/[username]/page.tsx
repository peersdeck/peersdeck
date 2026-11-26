import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props={params:Promise<{username:string}>};
export default async function FounderPage({params}:Props){
 const {username}=await params;const supabase=await createClient();
 const {data:profile}=await supabase.from("profiles").select("id,full_name,username,headline,bio,country_code,website_url,avatar_url").eq("username",username.toLowerCase()).maybeSingle();
 if(!profile)notFound();
 const {data:projects}=await supabase.from("projects").select("id,name,summary,category,location,stage,cover_image_url,published_at").eq("owner_id",profile.id).eq("status","published").eq("is_demo",false).order("published_at",{ascending:false});
 if(!projects?.length)notFound();
 return <main className="shell inner-page"><nav className="nav inner-nav"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><div className="nav-actions"><Link className="login-link" href="/discover">Discover</Link><Link className="button button-small" href="/signup">Join PeersDeck ↗</Link></div></nav>
 <section className="founder-public-hero"><div className="founder-public-avatar">{profile.avatar_url?<img src={profile.avatar_url} alt={profile.full_name}/>:<span>{(profile.full_name||"P").slice(0,1).toUpperCase()}</span>}</div><div className="eyebrow">PEERSDECK FOUNDER</div><h1>{profile.full_name}</h1>{profile.headline&&<h2>{profile.headline}</h2>}<p>{profile.bio||"Founder sharing projects and ideas on PeersDeck."}</p><div className="project-meta">{profile.country_code&&<span>{profile.country_code}</span>}{profile.website_url&&<a href={profile.website_url} target="_blank" rel="noreferrer">Website ↗</a>}</div></section>
 <section className="section founder-public-projects"><div className="eyebrow">PROJECTS</div><h2>Ideas in <em>motion.</em></h2><div className="homepage-project-grid">{projects.map(p=><Link className="homepage-project-card" href={`/projects/${p.id}`} key={p.id}><div className="homepage-project-image" style={p.cover_image_url?{backgroundImage:`url("${p.cover_image_url}")`}:{}}><span>{p.category}</span></div><div><h3>{p.name}</h3><p>{p.summary}</p><small>{p.location||p.stage.replaceAll("_"," ")}</small></div></Link>)}</div></section>
 <footer className="footer inner-footer"><Link href="/discover">Explore more projects</Link></footer></main>;
}
