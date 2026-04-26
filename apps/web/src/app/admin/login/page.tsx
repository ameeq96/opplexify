import type { Metadata } from "next";
import { AdminLogin } from "@/components/AdminLogin";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Secure admin login for Opplexify Product Lab."
};

export default function AdminLoginPage() {
  return (
    <main className="pt-16">
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase text-cobalt dark:text-neon">Admin</p>
          <h1 className="mt-4 text-4xl font-black tracking-normal sm:text-5xl">Access the administrative dashboard.</h1>
        </div>
        <div className="mt-10">
          <AdminLogin />
        </div>
      </section>
    </main>
  );
}
