"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const categories = ["Agriculture", "Technology", "Manufacturing", "Healthcare", "Logistics", "Renewable energy", "Education", "Retail", "Creative industries", "Other"];

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("Technology");
  const [country, setCountry] = useState("KE");
  const [location, setLocation] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [stage, setStage] = useState("idea");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please sign in again before saving your project.");
      const imageUrl = coverImage.trim();
      if (imageUrl) {
        const parsed = new URL(imageUrl);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("Please enter a valid public image URL.");
      }
      const { error } = await supabase.from("projects").insert({
        owner_id: user.id,
        name: name.trim(),
        summary: summary.trim(),
        category,
        country_code: country || null,
        location: location.trim(),
        cover_image_url: imageUrl || null,
        stage,
        status: "draft",
      });
      if (error) throw error;
      router.push("/dashboard/projects");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your project could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="shell dashboard-page">
    <nav className="nav"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><Link className="logout-button" href="/dashboard">Back to dashboard</Link></nav>
    <section className="project-form-wrap">
      <div className="eyebrow">FOUNDER WORKSPACE / NEW PROJECT</div>
      <h1>Give your idea<br /><em>a starting point.</em></h1>
      <p className="project-intro">Add the details that help people discover your project. You can expand the full story and milestones later.</p>
      <form className="project-form" onSubmit={submit}>
        <label>Project or business name<input required minLength={2} maxLength={120} value={name} onChange={e=>setName(e.target.value)} placeholder="What are you building?" /></label>
        <label>Short description<textarea required maxLength={2000} rows={5} value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Describe the problem you want to solve and the idea behind your project." /></label>
        <div className="project-form-row">
          <label>Industry<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Country code<input maxLength={2} pattern="[A-Za-z]{2}" value={country} onChange={e=>setCountry(e.target.value.toUpperCase())} placeholder="KE" /></label>
        </div>
        <label>City, region or location<input maxLength={120} value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Nairobi, Kenya" /></label>
        <label>Project cover image URL <span className="field-hint">Optional · use a public HTTPS image link</span><input type="url" value={coverImage} onChange={e=>setCoverImage(e.target.value)} placeholder="https://example.com/project-cover.jpg" /></label>
        <label>Current stage<select value={stage} onChange={e=>setStage(e.target.value)}><option value="idea">Idea</option><option value="prototype">Prototype</option><option value="early_revenue">Early revenue</option><option value="growth">Growth</option></select></label>
        {message && <div className="form-message" role="alert">{message}</div>}
        <div className="draft-notice">This saves a private draft. It will not publish your project or create a fundraising campaign.</div>
        <button className="button auth-submit" disabled={busy}>{busy ? "Saving draft..." : "Save project draft"} <span>↗</span></button>
      </form>
    </section>
  </main>;
}
