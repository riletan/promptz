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
} from "@cloudscape-design/components";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../amplify/data/resource";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchUserAttributes } from "aws-amplify/auth";

interface PromptEngineeringProps {
  promptId?: string;
}

interface PromptData {
  id: string;
  name: string;
  description: string;
  instruction: string;
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
              description="Describe the essence of your prompt in a few words."
              label={
                <span>
                  Description <i>- optional</i>{" "}
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
