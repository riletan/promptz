import { fetchPrompt } from "@/app/lib/actions/prompts";
import Prompt from "@/app/ui/prompts/prompt";
import { ResolvingMetadata, Metadata } from "next";

export async function generateMetadata(
  props: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // Get prompt ID from params
  const params = await props.params;

  // Fetch prompt data
  const prompt = await fetchPrompt(params.id);

  // Optionally access and extend parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: prompt.title,
    description: prompt.description,
    openGraph: {
      title: prompt.title,
      description: prompt.description,
      images: [...previousImages],
    },
  };
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return (
    <main className="py-8">
      <Prompt promptId={params.id} />
    </main>
  );
}
