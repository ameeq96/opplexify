"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { API_URL } from "../../lib/api";

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const initial: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: ""
};

export function ContactForm() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`${API_URL}/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) throw new Error("Unable to send message");
      setForm(initial);
      setStatus("Message sent. The team will reply soon.");
    } catch {
      setStatus("Could not send right now. Check the API server and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>
        Name
        <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
      </label>
      <label>
        Email
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
      </label>
      <label>
        Phone
        <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
      </label>
      <label>
        Subject
        <input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} />
      </label>
      <label>
        Message
        <textarea
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          required
        />
      </label>
      <button className="btn accent" type="submit" disabled={loading}>
        <Send size={18} /> {loading ? "Sending..." : "Send message"}
      </button>
      {status ? <p className="notice">{status}</p> : null}
    </form>
  );
}
