"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const [fullName,setFullName]=useState("");
  const [username,setUsername]=useState("");
  const [headline,setHeadline]=useState("");
  const [bio,setBio]=useState("");
  const [country,setCountry]=useState("");
  const [website,setWebsite]=useState("");
  const [avatar,setAvatar]=useState("");
  const [avatarFile,setAvatarFile]=useState<File|null>(null);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{(async()=>{
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.replace("/login");return;}
    const {data}=await supabase.from("profiles").select("full_name,username,headline,bio,country_code,website_url,avatar_url").eq("id",user.id).maybeSingle();
    if(data){setFullName(data.full_name||"");setUsername(data.username||"");setHeadline(data.headline||"");setBio(data.bio||"");setCountry(data.country_code||"");setWebsite(data.website_url||"");setAvatar(data.avatar_url||"");}
    setLoading(false);
  })();},[router]);

  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setMessage("");
    try{
      const supabase=createClient();
      const {data:{user}}=await supabase.auth.getUser();
      if(!user)throw new Error("Please sign in again.");
      const handle=username.trim().toLowerCase();
      if(handle && !/^[a-z0-9_]{3,30}$/.test(handle))throw new Error("Username must be 3–30 characters using letters, numbers or underscores.");
      for(const value of [website,avatar])if(value){const u=new URL(value);if(!["https:","http:"].includes(u.protocol))throw new Error("Website and image links must use HTTPS.");}
      let avatarUrl=avatar.trim()||null;
      if(avatarFile){
        if(!avatarFile.type.startsWith("image/")||avatarFile.size>5*1024*1024)throw new Error("Choose an image under 5 MB.");
        const ext=avatarFile.name.split(".").pop()?.toLowerCase()||"jpg";
        const path=user.id+"/avatar-"+Date.now()+"."+ext;
        const {error:uploadError}=await supabase.storage.from("profile-media").upload(path,avatarFile,{upsert:true,contentType:avatarFile.type});
        if(uploadError)throw uploadError;
        avatarUrl=supabase.storage.from("profile-media").getPublicUrl(path).data.publicUrl;
      }
      const {error}=await supabase.from("profiles").upsert({id:user.id,full_name:fullName.trim(),username:handle||null,headline:headline.trim(),bio:bio.trim(),country_code:country.trim().toUpperCase()||null,website_url:website.trim()||null,avatar_url:avatarUrl,updated_at:new Date().toISOString()});
      if(error)throw error;
      setMessage("Your profile has been saved.");
      router.refresh();
    }catch(e){setMessage(e instanceof Error?e.message:"Unable to save your profile.");}
    finally{setBusy(false);}
  }

  return <main className="shell dashboard-page">
    <nav className="nav"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><Link className="logout-button" href="/dashboard">Back to dashboard</Link></nav>
    <section className="project-form-wrap"><div className="eyebrow">FOUNDER WORKSPACE / YOUR PROFILE</div><h1>Tell your<br/><em>story.</em></h1><p className="project-intro">Introduce yourself to founders, collaborators and the wider PeersDeck community. Your profile appears publicly when you have at least one published project.</p>
      {loading?<p>Loading your profile…</p>:<form className="project-form" onSubmit={save}>
        <label>Full name<input required maxLength={100} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name"/></label>
        <label>Username <span className="field-hint">Optional · 3–30 letters, numbers or underscores</span><input maxLength={30} value={username} onChange={e=>setUsername(e.target.value)} placeholder="e.g. amina_njeri"/></label>
        <label>Professional headline<input maxLength={120} value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="Founder · Renewable energy entrepreneur"/></label>
        <label>About you<textarea rows={6} maxLength={2000} value={bio} onChange={e=>setBio(e.target.value)} placeholder="Share your experience, interests and what you hope to build."/></label>
        <label>Country code<input maxLength={2} pattern="[A-Za-z]{2}" value={country} onChange={e=>setCountry(e.target.value.toUpperCase())} placeholder="KE"/></label>
        <label>Website URL<input type="url" value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://yourwebsite.com"/></label>
        <label>Profile photo<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={e=>setAvatarFile(e.target.files?.[0]||null)}/><span className="field-hint">Upload JPG, PNG, WebP or AVIF · maximum 5 MB. Or use an image URL below.</span></label><label>Profile photo URL<input type="url" value={avatar} onChange={e=>setAvatar(e.target.value)} placeholder="https://example.com/photo.jpg"/></label>
        {message&&<div className="form-message success" role="status">{message}</div>}
        <button className="button auth-submit" disabled={busy}>{busy?"Saving…":"Save profile"} <span>↗</span></button>
      </form>}
    </section>
  </main>;
}
