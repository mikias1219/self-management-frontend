import { redirect } from "next/navigation";

export default function GrowthRedirectPage() {
  redirect("/life?tab=learning");
}
