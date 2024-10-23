// components/Logout.tsx

"use client";

import {
  Form,
  SpaceBetween,
  Button,
  Container,
  FormField,
  Input,
  Textarea,
  Tiles,
  RadioGroup,
  Alert,
  Box,
  Spinner,
} from "@cloudscape-design/components";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PromptGraphQLRepository } from "@/repositories/PromptRepository";
import { UserViewModel } from "@/models/UserViewModel";
import { PromptCategory, PromptViewModel, SdlcPhase } from "@/models/PromptViewModel";

interface PromptFormProps {
  prompt: PromptViewModel;
  user: UserViewModel;
}

interface FormData {
  id: string;
  name: string;
  description: string;
  instruction: string;
  sdlcPhase: string;
  category: string;
}

const repository = new PromptGraphQLRepository();

export default function PromptForm(props: PromptFormProps) {
  const router = useRouter();

  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    id: props.prompt.id,
    name: props.prompt.name,
    description: props.prompt.description,
    instruction: props.prompt.instruction,
    sdlcPhase: props.prompt.sdlcPhase,
    category: props.prompt.category,
  } as FormData);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const editedPrompt = props.prompt.copy();
      editedPrompt.name = formData.name;
      editedPrompt.description = formData.description;
      editedPrompt.instruction = formData.instruction;
      editedPrompt.sdlcPhase = formData.sdlcPhase as SdlcPhase;
      editedPrompt.category = formData.category as PromptCategory;
      editedPrompt.id === ""
        ? await repository.createPrompt(editedPrompt, props.user!)
        : await repository.updatePrompt(editedPrompt);

      router.back();
    } catch (error) {
      console.error("Error creating/updating prompt:", error);
      setFormError("An error occurred while saving the prompt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await handleSubmit();
      }}
    >
      <Form
        errorText={formError}
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="primary" formAction="submit" loading={loading}>
              Save prompt
            </Button>
          </SpaceBetween>
        }
      >
        <Container>
          <SpaceBetween direction="vertical" size="l">
            <FormField stretch description="A catchy name for your prompt." label="Name">
              <Input
                value={formData.name}
                onChange={({ detail }) => setFormData({ ...formData, name: detail.value })}
              />
            </FormField>
            <FormField stretch description="What is this prompt doing? What is the goal?" label="Description">
              <Input
                value={formData.description}
                onChange={({ detail }) => setFormData({ ...formData, description: detail.value })}
              />
            </FormField>
            <FormField
              label="Software Development Lifecycle (SDLC) Phase"
              description="Which phase of the SDLC does this prompt relate to?"
              stretch
            >
              <Tiles
                onChange={({ detail }) => setFormData({ ...formData, sdlcPhase: detail.value })}
                value={formData.sdlcPhase}
                items={[
                  {
                    label: "Plan",
                    description:
                      "Define project scope, objectives, and feasibility while estimating resources and timelines.",
                    value: "PLAN",
                  },
                  {
                    label: "Requirements Analysis",
                    description: "Gather, analyze, and document detailed software requirements.",
                    value: "REQ",
                  },
                  {
                    label: "Design",
                    description:
                      "Create the software architecture, user interface, and system design based on the requirements.",
                    value: "DESIGN",
                  },
                  {
                    label: "Implement",
                    description:
                      "Write, refactor, fix and review the actual code for the software according to design specifications.",
                    value: "IMPLEMENT",
                  },
                  {
                    label: "Test",
                    description:
                      "Conduct various types of testing to identify and fix bugs, ensuring the software meets quality standards and requirements.",
                    value: "TEST",
                  },
                  {
                    label: "Deploy",
                    description:
                      "Release the software to the production environment, including installation, configuration, and user training.",
                    value: "DEPLOY",
                  },
                  {
                    label: "Maintain",
                    description:
                      "Monitor, update, and support the software post-deployment, addressing issues and implementing new features as needed.",
                    value: "MAINTAIN",
                  },
                ]}
              />
            </FormField>
            <FormField
              label="Prompt Category"
              description="Is this prompt related to Amazon Q Developer Chat, Dev Agent, or inline code completion?"
              stretch
            >
              <RadioGroup
                onChange={({ detail }) => setFormData({ ...formData, category: detail.value })}
                value={formData.category}
                items={[
                  { value: "CHAT", label: "Chat" },
                  { value: "DEV_AGENT", label: "Dev Agent" },
                  { value: "INLINE", label: "Inline Code Completion" },
                ]}
              />
            </FormField>
            <FormField
              label="Instruction"
              description="The specific task you want Amazon Q Developer to perform."
              stretch
            >
              <Textarea
                onChange={({ detail }) => setFormData({ ...formData, instruction: detail.value })}
                value={formData.instruction}
                ariaRequired
                autoFocus
                placeholder=""
                spellcheck
                rows={10}
              />
            </FormField>
          </SpaceBetween>
        </Container>
      </Form>
    </form>
  );
}
