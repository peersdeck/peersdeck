"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-shell">
    <Link className="brand auth-brand" href="/"><span className="brand-mark">P</span> peers<span>deck</span></Link>
    <section className="auth-card">
      <div className="eyebrow">WELCOME BACK</div>
      <h1>Good to see<br /><em>you again.</em></h1>
      <p>Sign in to continue building connections and opportunities.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>Email address<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>
        <label>Password<input type="password" autoComplete="current-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" /></label>
        {message && <div className="form-message" role="alert">{message}</div>}
        <button className="button auth-submit" disabled={busy}>{busy ? "Signing in..." : "Sign in"} <span>↗</span></button>
      </form>
      <div className="auth-switch">New to PeersDeck? <Link href="/signup">Create an account</Link></div>
    </section>
    <p className="auth-foot">Built in Africa. Open to the world.</p>
  </main>;
}
