"use client";
import {
  BreadcrumbGroup,
  ContentLayout,
  Header,
  Link,
} from "@cloudscape-design/components";

import PromptEngineering from "@/components/PromptEngineering";

export default function CreatePrompt() {
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
            { text: "Create", href: "#" },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
      header={
        <Header
          variant="h1"
          description="Create a new prompt or prompt template"
        >
          New Prompt
        </Header>
      }
    >
      <PromptEngineering />
    </ContentLayout>
  );
}
