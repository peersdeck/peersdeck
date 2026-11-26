"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setSuccess(false);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName }, emailRedirectTo: "https://peersdeck.onrender.com/auth/callback" },
      });
      if (error) throw error;
      if (data.session) {
        window.location.href = "/dashboard";
        return;
      }
      setSuccess(true);
      setMessage("Your account request has been created. Check your email for the confirmation link before signing in.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-shell">
    <Link className="brand auth-brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link>
    <section className="auth-card">
      <div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>
      <h1>Make room for<br /><em>possibility.</em></h1>
      <p>Create your PeersDeck account and start connecting with people who can help ideas grow.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>Full name<input type="text" autoComplete="name" required maxLength={100} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" /></label>
        <label>Email address<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>
        <label>Password<input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" /></label>
        {message && <div className={success ? "form-message success" : "form-message"} role="status">{message}</div>}
        <button className="button auth-submit" disabled={busy}>{busy ? "Creating account..." : "Create account"} <span>↗</span></button>
      </form>
      <div className="auth-switch">Already a member? <Link href="/login">Sign in</Link></div>
      <small className="legal-note">By creating an account, you agree to use PeersDeck responsibly. Account verification and platform terms will be presented before public launch.</small>
    </section>
    <p className="auth-foot">Built in Africa. Open to the world.</p>
  </main>;
}
