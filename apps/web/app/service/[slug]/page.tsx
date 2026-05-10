import { permanentRedirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function ServiceDetailRedirect({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/services/${slug}`);
}
