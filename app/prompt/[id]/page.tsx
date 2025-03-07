import { fetchPrompt } from "@/app/lib/actions/prompts";
import Prompt from "@/app/ui/prompts/prompt";
import { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  // Get prompt ID from params
  const params = await props.params;

  // Fetch prompt data
  const prompt = await fetchPrompt(params.id);

  return {
    title: prompt.title,
    description: prompt.description,
    openGraph: {
      title: prompt.title,
      description: prompt.description,
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
