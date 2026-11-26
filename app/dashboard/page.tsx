import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type DemoProject={id:string;name:string;founder_name:string;location:string;category:string;description:string;is_active:boolean};

export default async function DashboardPage() {
 const supabase=await createClient();
 const {data,error}=await supabase.auth.getClaims();
 if(error||!data?.claims)redirect("/login");
 const userId=data.claims.sub as string;
 const email=typeof data.claims.email==="string"?data.claims.email:"Member";
 const [{data:profile},{data:projects},{data:adminRecord}] = await Promise.all([
  supabase.from("profiles").select("full_name,username,headline,bio").eq("id",userId).maybeSingle(),
  supabase.from("projects").select("id,status").eq("owner_id",userId),
  supabase.from("platform_admins").select("user_id").eq("user_id",userId).maybeSingle()
 ]);
 const isAdmin=!!adminRecord;
 const {data:demos}=isAdmin?await supabase.from("demo_projects").select("id,name,founder_name,location,category,description,is_active").order("display_order"): {data:null};
 const total=projects?.length||0;
 const published=projects?.filter(p=>p.status==="published").length||0;
 async function signOut(){ "use server";const client=await createClient();await client.auth.signOut();redirect("/");}
 async function deleteDemo(formData:FormData){
  "use server";
  const id=String(formData.get("demo_id")||"");
  if(!id) return;
  const client=await createClient();
  const {data:claims}=await client.auth.getClaims();
  const uid=claims?.claims?.sub;
  if(!uid) redirect("/login");
  const {data:admin}=await client.from("platform_admins").select("user_id").eq("user_id",uid).maybeSingle();
  if(!admin) throw new Error("Administrator access required.");
  const {error:deleteError}=await client.from("demo_projects").delete().eq("id",id);
  if(deleteError) throw new Error("Could not remove demo project.");
  revalidatePath("/dashboard");revalidatePath("/discover");
 }
 return <main className="shell dashboard-page">
 <nav className="nav"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><form action={signOut}><button className="logout-button">Sign out</button></form></nav>
 <section className="dashboard-welcome"><div className="eyebrow">YOUR PEERSDECK SPACE</div><h1>Welcome{profile?.full_name ? ", " + profile.full_name.split(" ")[0] : ""} to your<br/><em>next chapter.</em></h1><p>Signed in as {email}</p>{isAdmin&&<span className="admin-status">SUPER ADMIN</span>}</section>
 <div className="dashboard-metrics"><div><b>{total}</b><span>Your projects</span></div><div><b>{published}</b><span>Published publicly</span></div><div><b>{profile?.bio? "Ready":"Start"}</b><span>Founder profile</span></div></div>
 <section className="dashboard-grid">
 <article><span>01 / YOUR PROFILE</span><h2>Tell your story.</h2><p>Add your introduction, professional headline, location, website and profile photo. Your public founder page appears when you publish a project.</p><Link className="button" href="/dashboard/profile">{profile?.full_name?"Edit your profile":"Complete your profile"} <span>↗</span></Link></article>
 <article><span>02 / YOUR IDEAS</span><h2>Make an idea visible.</h2><p>Create project drafts, add your story and publish them to the public PeersDeck discovery directory.</p><Link className="button" href="/dashboard/projects">Open project studio <span>↗</span></Link></article>
 <article><span>03 / YOUR NETWORK</span><h2>Find your people.</h2><p>Public project discovery is open to everyone. Direct messaging, mentor matching and member connections are planned for a later release.</p><Link className="text-link" href="/discover">Explore projects →</Link></article>
 </section>
 {isAdmin&&<section className="admin-demo-panel"><div className="eyebrow">SUPER ADMIN / DEMO CONTENT</div><h2>Illustrative projects</h2><p>These are sample projects, not real founders or fundraising campaigns. Remove each demo from the database when genuine founder projects are ready to replace it.</p>{!demos?.length?<p>There are no demo projects remaining.</p>:<div className="admin-demo-list">{(demos as DemoProject[]).map(demo=><article className="admin-demo-row" key={demo.id}><div><b>{demo.name}</b><span>{demo.founder_name} · {demo.location} · {demo.category}</span><small>{demo.is_active?"Currently visible in Discover":"Inactive"}</small></div><form action={deleteDemo}><input type="hidden" name="demo_id" value={demo.id}/><button className="button button-small admin-delete" type="submit">Delete demo</button></form></article>)}</div>}</section>}
 {!isAdmin&&email.toLowerCase()==="peersdeck@gmail.com"&&<p className="dashboard-disclaimer">Your super-admin access is being activated. Refresh this page shortly.</p>}
 <p className="dashboard-disclaimer">PeersDeck currently provides founder profiles and project discovery. It does not process investments, loans, donations or payments.</p>
 </main>;
}
