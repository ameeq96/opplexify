import type { Metadata } from "next";
import { AdminConsole } from "../../components/admin/AdminConsole";
import { seoMetadata } from "../../lib/seo";

export const metadata: Metadata = {
  ...seoMetadata({
    title: "Admin Dashboard",
    description: "Opplexify admin dashboard.",
    path: "/admin",
    noIndex: true
  })
};

export default function AdminPage() {
  return <AdminConsole />;
}
