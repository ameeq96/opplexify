"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { API_URL } from "../../lib/api";

export function AdminLogin() {
  const isProduction = process.env.NODE_ENV === "production";
  const [email, setEmail] = useState(isProduction ? "" : "admin@opplexify.local");
  const [password, setPassword] = useState(isProduction ? "" : "Admin123!");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Login failed");
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
          <button className="btn accent" type="submit" disabled={loading}>
            <LogIn size={18} /> {loading ? "Signing in..." : "Sign in"}
          </button>
          {message ? <p className="notice">{message}</p> : null}
        </form>
      </div>
    </main>
  );
}
