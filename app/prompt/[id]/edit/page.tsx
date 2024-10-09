"use client";
import {
  BreadcrumbGroup,
  ContentLayout,
  Header,
} from "@cloudscape-design/components";
import PromptEngineering from "@/components/PromptEngineering";

export default function EditPrompt({ params }: { params: { id: string } }) {
  return (
    <ContentLayout
      defaultPadding
      headerVariant="high-contrast"
      maxContentWidth={1024}
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Promptz", href: "/" },
            { text: "Prompts & Prompt Templates", href: "/browse" },
            { text: `${params.id.substring(0, 7)}...`, href: `/${params.id}` },
            { text: "Edit", href: "#" },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
      header={
        <Header variant="h1" description="Engineer your prompts">
          Edit your Prompt
        </Header>
      }
    >
      <PromptEngineering promptId={params.id} />
    </ContentLayout>
  );
}
