"use client";
import {
  BreadcrumbGroup,
  ContentLayout,
  Header,
} from "@cloudscape-design/components";

import PromptForm, { PromptFormInputs } from "@/components/PromptForm";
import { PromptViewModel } from "@/models/PromptViewModel";
import { SubmitHandler } from "react-hook-form";
import { PromptGraphQLRepository } from "@/repositories/PromptRepository";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const repository = new PromptGraphQLRepository();

export default function CreatePrompt() {
  const { user } = useAuth();
  const router = useRouter();
  const newPrompt = new PromptViewModel();

  const savePrompt: SubmitHandler<PromptFormInputs> = async (data) => {
    await newPrompt.publish(data, user!, repository);
    router.push(`/prompt/${newPrompt.id}`);
  };

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
      <PromptForm prompt={newPrompt} onSubmit={savePrompt} />
    </ContentLayout>
  );
}
