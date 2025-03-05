import Prompt from "@/app/ui/prompts/prompt";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return (
    <main className="py-8">
      <Prompt promptId={params.id} />
    </main>
  );
}
