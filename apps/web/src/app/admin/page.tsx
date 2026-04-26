import type { Metadata } from "next";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage portfolio projects, quote requests, contact messages, testimonials, and pricing packages."
};

export default function AdminPage() {
  return (
    <main className="pt-16">
      <AdminDashboard />
    </main>
  );
}
