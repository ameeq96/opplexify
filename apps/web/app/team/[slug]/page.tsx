import { permanentRedirect } from "next/navigation";

export default function TeamDetailRedirect() {
  permanentRedirect("/about");
}
