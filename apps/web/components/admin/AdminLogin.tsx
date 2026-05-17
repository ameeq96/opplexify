"use client";

import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { API_URL } from "../../lib/api";

export function AdminLogin() {
  const isProduction = process.env.NODE_ENV === "production";
  const [email, setEmail] = useState(isProduction ? "" : "admin@opplexify.local");
  const [password, setPassword] = useState(isProduction ? "" : "Admin123!");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const fallback =
          response.status >= 500
            ? "Server could not complete login. Check API logs, .env database credentials, and run npm run db:seed."
            : "Login failed";
        throw new Error(payload.message ?? fallback);
      }
      localStorage.setItem("opplexify_token", payload.accessToken);
      window.location.href = "/admin";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-wrap">
      <div className="container page-hero">
        <p className="eyebrow">Admin</p>
        <h1>Dashboard login</h1>
        <p>Use your admin credentials after running the database seed.</p>
        <form className="form" onSubmit={submit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="btn accent" type="submit" disabled={!ready || loading}>
            <LogIn size={18} /> {loading ? "Signing in..." : ready ? "Sign in" : "Loading..."}
          </button>
          {message ? <p className="notice">{message}</p> : null}
        </form>
      </div>
    </main>
  );
}
