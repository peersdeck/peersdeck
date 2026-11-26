"use server";

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type AdminProject = {
 id:string; owner_id:string; name:string; status:string; funding_goal:number|null;
 amount_raised:number; currency:string; funding_deadline:string|null; created_at:string;
 category:string; location:string|null; review_note:string|null;
};

function money(value:number,currency:string){return new Intl.NumberFormat("en",{style:"currency",currency,maximumFractionDigits:0}).format(value||0);}
function daysLeft(deadline:string|null){if(!deadline)return null;const end=new Date(deadline+"T23:59:59Z");return Math.ceil((end.getTime()-Date.now())/86400000);}

async function requireAdmin(){
 const supabase=await createClient();
 const {data,error}=await supabase.auth.getClaims();
 if(error||!data?.claims)redirect("/login");
 const userId=data.claims.sub as string;
 const {data:admin}=await supabase.from("platform_admins").select("user_id").eq("user_id",userId).maybeSingle();
 if(!admin)throw new Error("Super Admin access required.");
 return {supabase,userId};
}

async function reviewProject(formData:FormData){
 "use server";
 const id=String(formData.get("project_id")||"");
 const decision=String(formData.get("decision")||"");
 if(!id||!["published","rejected"].includes(decision))throw new Error("Invalid review action.");
 const {supabase,userId}=await requireAdmin();
 const {error}=await supabase.from("projects").update({
  status:decision, reviewed_at:new Date().toISOString(), reviewed_by:userId,
  published_at:decision==="published"?new Date().toISOString():null,
  review_note:String(formData.get("review_note")||"").trim()||null,
  updated_at:new Date().toISOString()
 }).eq("id",id);
 if(error)throw new Error("Project review could not be saved: "+error.message);
 revalidatePath("/dashboard");revalidatePath("/discover");revalidatePath("/projects/"+id);
}

async function saveRaisedAmount(formData:FormData){
 "use server";
 const id=String(formData.get("project_id")||"");
 const amount=Number(formData.get("amount_raised"));
 if(!id||!Number.isFinite(amount)||amount<0)throw new Error("Enter a valid non-negative amount.");
 const {supabase}=await requireAdmin();
 const {error}=await supabase.from("projects").update({amount_raised:amount,updated_at:new Date().toISOString()}).eq("id",id);
 if(error)throw new Error("Raised amount could not be updated: "+error.message);
 revalidatePath("/dashboard");revalidatePath("/discover");revalidatePath("/projects/"+id);
}

async function deleteDemo(formData:FormData){
 "use server";
 const id=String(formData.get("demo_id")||"");if(!id)return;
 const {supabase}=await requireAdmin();
 const {error}=await supabase.from("demo_projects").delete().eq("id",id);
 if(error)throw new Error("Could not remove demo project: "+error.message);
 revalidatePath("/dashboard");revalidatePath("/discover");
}

async function signOut(){ "use server";const supabase=await createClient();await supabase.auth.signOut();redirect("/"); }

export default async function DashboardPage(){
 const supabase=await createClient();
 const {data,error}=await supabase.auth.getClaims();
 if(error||!data?.claims)redirect("/login");
 const userId=data.claims.sub as string;
 const email=typeof data.claims.email==="string"?data.claims.email:"Member";
 const [{data:profile},{data:ownProjects},{data:adminRecord}]=await Promise.all([
  supabase.from("profiles").select("full_name,username,headline,bio").eq("id",userId).maybeSingle(),
  supabase.from("projects").select("id,status").eq("owner_id",userId),
  supabase.from("platform_admins").select("user_id").eq("user_id",userId).maybeSingle()
 ]);
 const isAdmin=!!adminRecord;
 const total=ownProjects?.length||0;
 const published=ownProjects?.filter(p=>p.status==="published").length||0;
 let adminProjects:AdminProject[]=[];
 let demos:{id:string;name:string;founder_name:string;location:string;category:string;description:string;is_active:boolean}[]=[];
 let ownerNames:Record<string,string>={};
 let totalsByCurrency:{currency:string;raised:number;goal:number;balance:number;projects:number}[]=[];
 let statusCounts:Record<string,number>={};
 if(isAdmin){
  const [{data:rows},{data:demoRows}]=await Promise.all([
   supabase.from("projects").select("id,owner_id,name,status,funding_goal,amount_raised,currency,funding_deadline,created_at,category,location,review_note,is_demo").eq("is_demo",false).order("created_at",{ascending:false}),
   supabase.from("demo_projects").select("id,name,founder_name,location,category,description,is_active").order("display_order")
  ]);
  adminProjects=(rows||[]) as AdminProject[];
  demos=demoRows||[];
  const ids=Array.from(new Set(adminProjects.map(p=>p.owner_id)));
  if(ids.length){const {data:owners}=await supabase.from("profiles").select("id,full_name").in("id",ids);for(const owner of owners||[])ownerNames[owner.id]=owner.full_name||"Founder";}
  const grouped=new Map<string,{currency:string;raised:number;goal:number;balance:number;projects:number}>();
  for(const p of adminProjects){const c=p.currency||"USD";const item=grouped.get(c)||{currency:c,raised:0,goal:0,balance:0,projects:0};item.raised+=Number(p.amount_raised||0);item.goal+=Number(p.funding_goal||0);item.balance+=Math.max(0,Number(p.funding_goal||0)-Number(p.amount_raised||0));item.projects++;grouped.set(c,item);statusCounts[p.status]=(statusCounts[p.status]||0)+1;}
  totalsByCurrency=Array.from(grouped.values()).sort((a,b)=>a.currency.localeCompare(b.currency));
 }
 return <main className="shell dashboard-page">
 <nav className="nav"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><form action={signOut}><button className="logout-button">Sign out</button></form></nav>
 <section className="dashboard-welcome"><div className="eyebrow">{isAdmin?"PLATFORM CONTROL CENTRE":"YOUR PEERSDECK SPACE"}</div><h1>{isAdmin?"Platform overview":<>Welcome{profile?.full_name?", "+profile.full_name.split(" ")[0]:""} to your<br/><em>next chapter.</em></>}</h1><p>Signed in as {email}</p>{isAdmin&&<span className="admin-status">SUPER ADMIN</span>}</section>
 {!isAdmin&&<><div className="dashboard-metrics"><div><b>{total}</b><span>Your projects</span></div><div><b>{published}</b><span>Published publicly</span></div><div><b>{profile?.bio?"Ready":"Start"}</b><span>Founder profile</span></div></div><section className="dashboard-grid">
 <article><span>01 / YOUR PROFILE</span><h2>Tell your story.</h2><p>Add your introduction, professional headline, location, website and profile photo. Your public founder page appears when you publish a project.</p><Link className="button" href="/dashboard/profile">Edit your profile ↗</Link></article>
 <article><span>02 / YOUR IDEAS</span><h2>Make an idea visible.</h2><p>Create project drafts, add your story and submit them for Super Admin review before public publication.</p><Link className="button" href="/dashboard/projects">Open project studio ↗</Link></article>
 <article><span>03 / YOUR NETWORK</span><h2>Find your people.</h2><p>Public project discovery is open to everyone. Direct messaging and mentor matching are planned for a later release.</p><Link className="text-link" href="/discover">Explore projects →</Link></article>
 </section></>}
 {isAdmin&&<><section className="admin-analytics">
 <div className="admin-analytics-heading"><div><div className="eyebrow">LIVE DATABASE ANALYTICS</div><h2>Funding overview</h2><p>Totals are grouped by currency. Different currencies are never added together.</p></div><span className="admin-live-tag">DATABASE LIVE</span></div>
 <div className="admin-stat-grid"><article><b>{adminProjects.length}</b><span>Total projects</span></article><article><b>{statusCounts.submitted||0}</b><span>Awaiting approval</span></article><article><b>{statusCounts.published||0}</b><span>Published projects</span></article><article><b>{statusCounts.rejected||0}</b><span>Rejected projects</span></article></div>
 <div className="admin-currency-grid">{totalsByCurrency.length?totalsByCurrency.map(t=><article key={t.currency}><span>{t.currency} · {t.projects} projects</span><div><small>CUMULATIVE AMOUNT RAISED</small><b>{money(t.raised,t.currency)}</b></div><div><small>TOTAL REQUIRED</small><strong>{money(t.goal,t.currency)}</strong></div><div><small>REMAINING BALANCE</small><strong>{money(t.balance,t.currency)}</strong></div></article>):<p>No founder project funding records yet.</p>}</div>
 </section>
 <section className="admin-project-panel"><div className="admin-section-heading"><div><div className="eyebrow">PLATFORM-WIDE PROJECT REGISTER</div><h2>All founder projects</h2><p>Review submissions, approve publication and monitor each funding target.</p></div><span>{adminProjects.length} records</span></div>
 {!adminProjects.length?<p className="admin-empty">No founder projects have been submitted yet.</p>:<div className="admin-project-list">{adminProjects.map(p=>{const goal=Number(p.funding_goal||0),raised=Number(p.amount_raised||0),balance=Math.max(0,goal-raised),progress=goal>0?Math.min(100,raised/goal*100):0,days=daysLeft(p.funding_deadline);return <article className="admin-project-card" key={p.id}>
 <div className="admin-project-top"><div><span className="admin-project-category">{p.category||"Unclassified"}</span><h3>{p.name}</h3><p>{ownerNames[p.owner_id]||"Founder"} · {p.location||"Location not provided"}</p></div><span className={"admin-project-status status-"+p.status}>{p.status.replaceAll("_"," ")}</span></div>
 <div className="admin-project-finance"><div><small>AMOUNT RAISED</small><b>{money(raised,p.currency||"USD")}</b></div><div><small>TOTAL REQUIRED</small><b>{money(goal,p.currency||"USD")}</b></div><div><small>BALANCE</small><b>{money(balance,p.currency||"USD")}</b></div><div><small>DAYS LEFT</small><b>{days===null?"Not set":days<0?"Expired":days===0?"Last day":days+" days"}</b></div></div>
 <div className="admin-progress"><span style={{width:progress+"%"}}/></div><div className="admin-progress-label">{goal>0?progress.toFixed(1)+"% of target recorded":"Funding target not entered"}{p.funding_deadline?" · Deadline "+p.funding_deadline:" · No deadline"}</div>
 <form className="admin-raised-form" action={saveRaisedAmount}><input type="hidden" name="project_id" value={p.id}/><label>Verified amount raised ({p.currency||"USD"})<input name="amount_raised" type="number" min="0" step="0.01" defaultValue={raised}/></label><button className="button button-small secondary-action" type="submit">Save amount</button></form>
 {p.status==="submitted"&&<form className="admin-review-form" action={reviewProject}><input type="hidden" name="project_id" value={p.id}/><label>Review note (optional)<input name="review_note" placeholder="Feedback for the founder"/></label><div><button className="button button-small publish-action" name="decision" value="published">Approve & publish</button><button className="button button-small admin-delete" name="decision" value="rejected">Reject</button></div></form>}
 {p.status==="published"&&<form className="admin-review-form" action={reviewProject}><input type="hidden" name="project_id" value={p.id}/><label>Publication note (optional)<input name="review_note" placeholder="Reason for unpublishing"/></label><button className="button button-small secondary-action" name="decision" value="rejected">Unpublish / reject</button></form>}
 <div className="admin-project-links"><Link href={"/projects/"+p.id}>View project ↗</Link><Link href={"/dashboard/projects/"+p.id}>Open editor ↗</Link></div>
 </article>})}</div>}</section>
 <section className="admin-demo-panel"><div className="eyebrow">SUPER ADMIN / DEMO CONTENT</div><h2>Illustrative projects</h2><p>Sample projects are not real founders or fundraising campaigns. Delete them when genuine founder projects replace the examples.</p>{!demos.length?<p>There are no demo projects remaining.</p>:<div className="admin-demo-list">{demos.map(d=><article className="admin-demo-row" key={d.id}><div><b>{d.name}</b><span>{d.founder_name} · {d.location} · {d.category}</span><small>{d.is_active?"Visible in Discover":"Inactive"}</small></div><form action={deleteDemo}><input type="hidden" name="demo_id" value={d.id}/><button className="button button-small admin-delete" type="submit">Delete demo</button></form></article>)}</div>}</section></>}
 <p className="dashboard-disclaimer">Funding figures are database records and must be independently verified. PeersDeck does not currently process, hold or disburse investments, loans, donations or payments.</p>
 </main>;
}
