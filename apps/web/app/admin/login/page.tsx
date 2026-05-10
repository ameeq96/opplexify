import type { Metadata } from "next";
import { AdminLogin } from "../../../components/admin/AdminLogin";
import { seoMetadata } from "../../../lib/seo";

export const metadata: Metadata = {
  ...seoMetadata({
    title: "Admin Login",
    description: "Opplexify admin login.",
    path: "/admin/login",
    noIndex: true
  })
};

export default function AdminLoginPage() {
  return <AdminLogin />;
}
