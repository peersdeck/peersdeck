"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Category = { id: string; name: string };
const currencies = ["USD","KES","UGX","TZS","RWF","NGN","GHS","ZAR","EUR","GBP"];
const acceptedRegistration = ["application/pdf","image/jpeg","image/png"];
const safeName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);

export default function NewProjectPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("KE");
  const [location, setLocation] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [stage, setStage] = useState("idea");
  const [fundingGoal, setFundingGoal] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [pitchDeck, setPitchDeck] = useState<File | null>(null);
  const [videoPitch, setVideoPitch] = useState<File | null>(null);
  const [registrationDocs, setRegistrationDocs] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    createClient().from("project_categories").select("id,name").eq("is_active", true).order("display_order")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setMessage("Project classifications could not be loaded. Please refresh and try again.");
        else { setCategories(data || []); if (data?.length) setCategory(data[0].name); }
      });
    return () => { active = false; };
  }, []);

  async function uploadDocument(supabase: ReturnType<typeof createClient>, userId: string, projectId: string, file: File, type: "pitch_deck" | "video_pitch" | "registration_document") {
    const path = userId + "/" + projectId + "/" + type + "-" + Date.now() + "-" + safeName(file.name);
    const { error } = await supabase.storage.from("project-submissions").upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    return { project_id: projectId, owner_id: userId, document_type: type, storage_path: path, file_name: file.name, mime_type: file.type, file_size: file.size };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      if (!category || !categories.some((item) => item.name === category)) throw new Error("Select a valid project classification.");
      const amount = Number(fundingGoal);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter the amount you are seeking to raise.");
      if (pitchDeck && (pitchDeck.size > 20 * 1024 * 1024 || !["application/pdf","application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml.presentation"].includes(pitchDeck.type))) throw new Error("Pitch deck must be a PDF or PowerPoint file under 20 MB.");
      if (videoPitch && (videoPitch.size > 100 * 1024 * 1024 || !["video/mp4","video/webm","video/quicktime"].includes(videoPitch.type))) throw new Error("Video pitch must be MP4, WebM or MOV and under 100 MB.");
      if (registrationDocs.length > 5 || registrationDocs.some((file) => file.size > 10 * 1024 * 1024 || !acceptedRegistration.includes(file.type))) throw new Error("Upload up to 5 registration documents (PDF, JPG or PNG), each under 10 MB.");
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please sign in again before saving your project.");
      const imageUrl = coverImage.trim();
      if (imageUrl) { const parsed = new URL(imageUrl); if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("Please enter a valid public image URL."); }
      let coverImageUrl = imageUrl || null;
      if (coverFile) {
        if (!coverFile.type.startsWith("image/") || coverFile.size > 5 * 1024 * 1024) throw new Error("Choose a cover image under 5 MB.");
        const ext = coverFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = user.id + "/project-" + Date.now() + "." + ext;
        const { error: uploadError } = await supabase.storage.from("profile-media").upload(path, coverFile, { upsert: true, contentType: coverFile.type });
        if (uploadError) throw uploadError;
        coverImageUrl = supabase.storage.from("profile-media").getPublicUrl(path).data.publicUrl;
      }
      const { data: project, error } = await supabase.from("projects").insert({
        owner_id: user.id, name: name.trim(), summary: summary.trim(), category,
        country_code: country || null, location: location.trim(), cover_image_url: coverImageUrl,
        stage, funding_goal: amount, currency, status: "draft",
      }).select("id").single();
      if (error || !project) throw error || new Error("Your project draft could not be created.");
      const documents: Array<ReturnType<typeof uploadDocument> extends Promise<infer T> ? T : never> = [];
      if (pitchDeck) documents.push(await uploadDocument(supabase, user.id, project.id, pitchDeck, "pitch_deck"));
      if (videoPitch) documents.push(await uploadDocument(supabase, user.id, project.id, videoPitch, "video_pitch"));
      for (const file of registrationDocs) documents.push(await uploadDocument(supabase, user.id, project.id, file, "registration_document"));
      if (documents.length) {
        const { error: docError } = await supabase.from("project_documents").insert(documents);
        if (docError) throw new Error("Project draft was saved, but a supporting document could not be recorded: " + docError.message);
      }
      router.push("/dashboard/projects"); router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your project could not be saved. Please try again.");
    } finally { setBusy(false); }
  }

  return <main className="shell dashboard-page">
    <nav className="nav"><Link className="brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link><Link className="logout-button" href="/dashboard">Back to dashboard</Link></nav>
    <section className="project-form-wrap">
      <div className="eyebrow">FOUNDER WORKSPACE / NEW PROJECT</div>
      <h1>Present your project<br /><em>to the world.</em></h1>
      <p className="project-intro">Complete your project application, state the funding you are seeking and provide supporting materials. Your project appears in Discover after you publish it.</p>
      <form className="project-form" onSubmit={submit}>
        <label>Project or business name<input required minLength={2} maxLength={120} value={name} onChange={e=>setName(e.target.value)} placeholder="What are you building?" /></label>
        <label>Short description<textarea required maxLength={2000} rows={5} value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Describe the problem you want to solve and the idea behind your project." /></label>
        <div className="project-form-row">
          <label>Project classification<select required value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(item=><option key={item.id} value={item.name}>{item.name}</option>)}</select><span className="field-hint">Categories are managed in PeersDeck and loaded from the database.</span></label>
          <label>Country code<input maxLength={2} pattern="[A-Za-z]{2}" value={country} onChange={e=>setCountry(e.target.value.toUpperCase())} placeholder="KE" /></label>
        </div>
        <label>City, region or location<input maxLength={120} value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Nairobi, Kenya" /></label>
        <div className="project-form-row">
          <label>Amount you are seeking to raise<input required type="number" min="1" step="0.01" value={fundingGoal} onChange={e=>setFundingGoal(e.target.value)} placeholder="Enter target amount" /></label>
          <label>Currency<select value={currency} onChange={e=>setCurrency(e.target.value)}>{currencies.map(code=><option key={code} value={code}>{code}</option>)}</select></label>
        </div>
        <label>Upload project cover image<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={e=>setCoverFile(e.target.files?.[0]||null)}/><span className="field-hint">Optional · JPG, PNG, WebP or AVIF · maximum 5 MB</span></label>
        <label>Or use a project cover image URL<input type="url" value={coverImage} onChange={e=>setCoverImage(e.target.value)} placeholder="https://example.com/project-cover.jpg" /></label>
        <label>Current stage<select value={stage} onChange={e=>setStage(e.target.value)}><option value="idea">Idea</option><option value="prototype">Prototype</option><option value="early_revenue">Early revenue</option><option value="growth">Growth</option></select></label>
        <div className="document-upload-group"><h2>Pitch materials</h2><p>These documents help visitors and future reviewers understand your project.</p>
          <label>Pitch deck<input type="file" accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={e=>setPitchDeck(e.target.files?.[0]||null)}/><span className="field-hint">{pitchDeck ? pitchDeck.name : "PDF or PowerPoint · maximum 20 MB"}</span></label>
          <label>Video pitch<input type="file" accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" onChange={e=>setVideoPitch(e.target.files?.[0]||null)}/><span className="field-hint">{videoPitch ? videoPitch.name : "MP4, WebM or MOV · maximum 100 MB"}</span></label>
        </div>
        <div className="document-upload-group"><h2>Business registration documents</h2><p>Upload registration certificates or other official business documents. These are private and are not displayed in public Discover.</p>
          <label>Registration documents<input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={e=>setRegistrationDocs(Array.from(e.target.files||[]))}/><span className="field-hint">{registrationDocs.length ? registrationDocs.map(file=>file.name).join(", ") : "PDF, JPG or PNG · up to 5 files · 10 MB each"}</span></label>
        </div>
        {message && <div className="form-message" role="alert">{message}</div>}
        <div className="draft-notice">This saves a private draft. Review it in your project studio and publish it when ready. PeersDeck does not process investments or payments.</div>
        <button className="button auth-submit" disabled={busy || categories.length===0}>{busy ? "Saving application and files..." : "Save project application"} <span>↗</span></button>
      </form>
    </section>
  </main>;
}
