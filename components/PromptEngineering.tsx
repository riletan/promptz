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
} from "@cloudscape-design/components";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../amplify/data/resource";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchUserAttributes } from "aws-amplify/auth";

type SdlcPhase =
  | "PLAN"
  | "REQ"
  | "DESIGN"
  | "IMPLEMENT"
  | "TEST"
  | "DEPLOY"
  | "MAINTAIN";

type Category = "CHAT" | "INLINE" | "DEV_AGENT";

interface PromptEngineeringProps {
  promptId?: string;
}

interface PromptData {
  id: string;
  name: string;
  description: string;
  instruction: string;
  sdlc_phase: SdlcPhase;
  category: Category;
}

const client = generateClient<Schema>();

export default function PromptEngineering(props: PromptEngineeringProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [promptData, setPromptData] = useState({} as PromptData);

  useEffect(() => {
    if (props.promptId) {
      loadPrompt(props.promptId);
    }
  }, [props.promptId]);

  const loadPrompt = async (promptId: string) => {
    const { data: prompt } = await client.models.prompt.get({ id: promptId });
    if (prompt) {
      setPromptData({
        id: prompt.id,
        name: prompt.name,
        description: prompt.description ? prompt.description : "",
        instruction: prompt.instruction,
        sdlc_phase: prompt.sdlc_phase as SdlcPhase,
        category: prompt.category as Category,
      });
    }
  };

  const handleSubmit = async () => {
    const userAttributes = await fetchUserAttributes();

    if (promptData.id) {
      await client.models.prompt.update(
        { ...promptData, owner_username: userAttributes.preferred_username },
        {
          authMode: "userPool",
        }
      );
    } else {
      await client.models.prompt.create(
        {
          ...promptData,
          owner_username: userAttributes.preferred_username,
        },
        {
          authMode: "userPool",
        }
      );
    }
    router.back();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setLoading(true);
        handleSubmit();
        setLoading(false);
      }}
    >
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              formAction="none"
              variant="link"
              onClick={() => router.back()}
            >
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
            <FormField
              stretch
              description="A catchy name for your prompt."
              label="Name"
            >
              <Input
                value={promptData.name}
                onChange={({ detail }) =>
                  setPromptData({ ...promptData, name: detail.value })
                }
              />
            </FormField>
            <FormField
              stretch
              description="Describe the essence of your prompt in a few words to help others understand the meaning of this prompt."
              label={
                <span>
                  Description <i>- optional</i>
                </span>
              }
            >
              <Input
                value={promptData.description}
                onChange={({ detail }) =>
                  setPromptData({ ...promptData, description: detail.value })
                }
              />
            </FormField>
            <FormField
              label="Software Development Lifecycle (SDLC) Phase"
              description="Which phase of the SDLC does this prompt relate to?"
              stretch
            >
              <Tiles
                onChange={({ detail }) =>
                  setPromptData({
                    ...promptData,
                    sdlc_phase: detail.value as SdlcPhase,
                  })
                }
                value={promptData.sdlc_phase}
                items={[
                  {
                    label: "Plan",
                    description:
                      "Define project scope, objectives, and feasibility while estimating resources and timelines.",
                    value: "PLAN",
                  },
                  {
                    label: "Requirements Analysis",
                    description:
                      "Gather, analyze, and document detailed software requirements.",
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
                onChange={({ detail }) =>
                  setPromptData({
                    ...promptData,
                    category: detail.value as Category,
                  })
                }
                value={promptData.category}
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
                onChange={({ detail }) =>
                  setPromptData({ ...promptData, instruction: detail.value })
                }
                value={promptData.instruction}
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
