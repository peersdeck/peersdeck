"use client";

import Link from "next/link";
import { useEffect,useState,type FormEvent } from "react";
import { useParams,useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Project={id:string;name:string;summary:string;category:string;country_code:string|null;location:string;stage:string;cover_image_url:string|null;problem:string;solution:string;business_model:string;website_url:string|null;status:string;funding_goal:number|null;currency:string};

export default function EditProjectPage(){
 const {id}=useParams<{id:string}>();const router=useRouter();
 const [project,setProject]=useState<Project|null>(null);const [categories,setCategories]=useState<string[]>([]);const [form,setForm]=useState({name:"",summary:"",category:"Technology",country_code:"KE",location:"",stage:"idea",cover_image_url:"",problem:"",solution:"",business_model:"",website_url:"",funding_goal:"",currency:"USD"});
 const [message,setMessage]=useState("");const [coverFile,setCoverFile]=useState<File|null>(null);const [busy,setBusy]=useState(false);const [loading,setLoading]=useState(true);
 useEffect(()=>{const supabase=createClient();supabase.from("project_categories").select("name").eq("is_active",true).order("display_order").then(({data})=>setCategories((data||[]).map(x=>x.name)));},[]);
 useEffect(()=>{(async()=>{const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user){router.replace("/login");return;}
 const {data,error}=await supabase.from("projects").select("id,name,summary,category,country_code,location,stage,cover_image_url,problem,solution,business_model,website_url,status,funding_goal,currency").eq("id",id).eq("owner_id",user.id).maybeSingle();
 if(error||!data){setMessage("Project not found or you do not have permission to edit it.");setLoading(false);return;}
 setProject(data);setForm({name:data.name||"",summary:data.summary||"",category:data.category||"Technology",country_code:data.country_code||"",location:data.location||"",stage:data.stage||"idea",cover_image_url:data.cover_image_url||"",problem:data.problem||"",solution:data.solution||"",business_model:data.business_model||"",website_url:data.website_url||"",funding_goal:data.funding_goal==null?"":String(data.funding_goal),currency:data.currency||"USD"});setLoading(false);
 })();},[id,router]);
 function change(key:keyof typeof form,value:string){setForm(old=>({...old,[key]:value}));}
 async function persist(status:"draft"|"published"){
  setBusy(true);setMessage("");
  try{const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Please sign in again.");
   for(const value of [form.cover_image_url,form.website_url])if(value){const u=new URL(value);if(!["https:","http:"].includes(u.protocol))throw new Error("Please use a valid HTTP or HTTPS link.");}
   let coverImageUrl=form.cover_image_url.trim()||null;
   if(coverFile){if(!coverFile.type.startsWith("image/")||coverFile.size>5*1024*1024)throw new Error("Choose an image under 5 MB.");const ext=coverFile.name.split(".").pop()?.toLowerCase()||"jpg";const path=user.id+"/project-"+id+"-"+Date.now()+"."+ext;const {error:uploadError}=await supabase.storage.from("profile-media").upload(path,coverFile,{upsert:true,contentType:coverFile.type});if(uploadError)throw uploadError;coverImageUrl=supabase.storage.from("profile-media").getPublicUrl(path).data.publicUrl;}
   const update={name:form.name.trim(),summary:form.summary.trim(),category:form.category,country_code:form.country_code.trim().toUpperCase()||null,location:form.location.trim(),stage:form.stage,cover_image_url:coverImageUrl,problem:form.problem.trim(),solution:form.solution.trim(),business_model:form.business_model.trim(),website_url:form.website_url.trim()||null,funding_goal:form.funding_goal?Number(form.funding_goal):null,currency:form.currency,status,published_at:status==="published"?(project?.status==="published"?undefined:new Date().toISOString()):null,updated_at:new Date().toISOString()};
   const {error}=await supabase.from("projects").update(update).eq("id",id).eq("owner_id",user.id);if(error)throw error;
   setProject(old=>old?{...old,...update,published_at:status==="published"?(old.status==="published"?(old as any).published_at:new Date().toISOString()):null}:old);
   setMessage(status==="published"?"Your project is now published in Discover.":"Your project draft has been saved.");router.refresh();
  }catch(e){setMessage(e instanceof Error?e.message:"Unable to save project.");}finally{setBusy(false);}
 }
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();await persist(project?.status==="published"?"published":"draft");}
 return <main className="shell dashboard-page"><nav className="nav"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><Link className="logout-button" href="/dashboard/projects">Back to projects</Link></nav>
 <section className="project-form-wrap"><div className="eyebrow">FOUNDER WORKSPACE / PROJECT EDITOR</div><h1>Shape your<br/><em>project story.</em></h1>
 {loading?<p>Loading project…</p>:!project?<div className="form-message" role="alert">{message}</div>:<form className="project-form" onSubmit={submit}>
 <label>Project or business name<input required minLength={2} maxLength={120} value={form.name} onChange={e=>change("name",e.target.value)}/></label>
 <label>Short description<textarea required maxLength={2000} rows={4} value={form.summary} onChange={e=>change("summary",e.target.value)}/></label>
 <div className="project-form-row"><label>Industry<select value={form.category} onChange={e=>change("category",e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select></label><label>Country code<input maxLength={2} pattern="[A-Za-z]{2}" value={form.country_code} onChange={e=>change("country_code",e.target.value.toUpperCase())}/></label></div>
 <label>Location<input maxLength={120} value={form.location} onChange={e=>change("location",e.target.value)}/></label>
 <div className="project-form-row"><label>Project classification<select required value={form.category} onChange={e=>change("category",e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select></label><label>Amount sought<input type="number" min="1" step="0.01" value={form.funding_goal} onChange={e=>change("funding_goal",e.target.value)} placeholder="Funding target"/></label><label>Currency<select value={form.currency} onChange={e=>change("currency",e.target.value)}>{["USD","KES","UGX","TZS","RWF","NGN","GHS","ZAR","EUR","GBP"].map(x=><option key={x}>{x}</option>)}</select></label></div>
 <label>Upload project cover image<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={e=>setCoverFile(e.target.files?.[0]||null)}/><span className="field-hint">Optional · JPG, PNG, WebP or AVIF · maximum 5 MB</span></label><label>Or use a project cover image URL<input type="url" value={form.cover_image_url} onChange={e=>change("cover_image_url",e.target.value)} placeholder="https://…"/></label>
 <label>Current stage<select value={form.stage} onChange={e=>change("stage",e.target.value)}><option value="idea">Idea</option><option value="prototype">Prototype</option><option value="early_revenue">Early revenue</option><option value="growth">Growth</option></select></label>
 <label>The problem<textarea rows={3} maxLength={3000} value={form.problem} onChange={e=>change("problem",e.target.value)} placeholder="What challenge are you addressing?"/></label>
 <label>Your solution<textarea rows={3} maxLength={3000} value={form.solution} onChange={e=>change("solution",e.target.value)} placeholder="How does your project solve it?"/></label>
 <label>Business model<textarea rows={3} maxLength={3000} value={form.business_model} onChange={e=>change("business_model",e.target.value)} placeholder="How will the project sustain itself?"/></label>
 <label>Project website<input type="url" value={form.website_url} onChange={e=>change("website_url",e.target.value)} placeholder="https://…"/></label>
 {message&&<div className={message.includes("published")||message.includes("saved")?"form-message success":"form-message"} role="status">{message}</div>}
 <button className="button auth-submit" disabled={busy}>{busy?"Saving…":"Save changes"} <span>↗</span></button>
 {project.status!=="published"?<button type="button" className="button publish-action" disabled={busy} onClick={()=>persist("published")}>{busy?"Publishing…":"Publish project"} <span>↗</span></button>:<button type="button" className="button secondary-action" disabled={busy} onClick={()=>persist("draft")}>Unpublish project</button>}
 <p className="field-hint">Published projects are visible publicly in Discover. PeersDeck does not process investments or payments.</p>
 </form>}</section></main>;
}
