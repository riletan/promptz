"use client";
import Prompt from "@/components/Prompt";
import { BreadcrumbGroup, ContentLayout } from "@cloudscape-design/components";

export default function ViewPrompt({ params }: { params: { id: string } }) {
  return (
    <ContentLayout
      defaultPadding
      headerVariant="high-contrast"
      maxContentWidth={1024}
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Promptz", href: "/" },
            { text: "Prompts & Prompt Templates", href: "/prompt" },
            { text: `${params.id.substring(0, 7)}...`, href: `/${params.id}` },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
    >
      <Prompt promptId={params.id} />
    </ContentLayout>
  );
}
