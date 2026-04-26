"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { API_URL } from "@/lib/api";

export function AdminLogin() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password")
        })
      });

      if (!response.ok) {
        throw new Error("Invalid login");
      }

      const data = await response.json();
      window.localStorage.setItem("opplexify_admin_token", data.accessToken);
      router.push("/admin");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submitLogin} className="surface mx-auto grid max-w-md gap-4 rounded-lg p-6">
      <label className="grid gap-2 text-sm font-bold">
        Email
        <input
          name="email"
          type="email"
          required
          defaultValue="admin@opplexify.dev"
          className="focus-ring h-12 rounded-md border border-[var(--line)] bg-white px-3 font-normal text-ink dark:bg-[#07111f] dark:text-white"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Password
        <input
          name="password"
          type="password"
          required
          defaultValue="ChangeMe123!"
          className="focus-ring h-12 rounded-md border border-[var(--line)] bg-white px-3 font-normal text-ink dark:bg-[#07111f] dark:text-white"
        />
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ef6949] disabled:opacity-70"
      >
        {status === "loading" ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
        Login
      </button>
      {status === "error" ? <p className="text-sm font-semibold text-signal">Login failed. Check backend and credentials.</p> : null}
    </form>
  );
}
