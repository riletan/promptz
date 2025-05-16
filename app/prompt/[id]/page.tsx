import { fetchPromptSlug } from "@/app/lib/actions/prompts";
import { notFound, permanentRedirect } from "next/navigation";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const slug = await fetchPromptSlug(params.id);
  if (!slug) {
    notFound();
  }
  permanentRedirect(`/prompts/prompt/${slug}`);
}
