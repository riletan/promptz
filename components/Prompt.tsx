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
  Header,
  Box,
  CopyToClipboard,
  KeyValuePairs,
  Link,
  ProgressBar,
  StatusIndicator,
} from "@cloudscape-design/components";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../amplify/data/resource";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchUserAttributes } from "aws-amplify/auth";

interface PromptProps {
  promptId: string;
}

const client = generateClient<Schema>();

export default function PromptEngineering(props: PromptProps) {
  const router = useRouter();

  const [prompt, setPrompt] = useState<Schema["prompt"]["type"]>();

  useEffect(() => {
    loadPrompt(props.promptId);
  });

  const loadPrompt = async (promptId: string) => {
    const { data: prompt } = await client.models.prompt.get({ id: promptId });
    if (prompt) {
      setPrompt(prompt);
    }
  };

  return (
    <Container
      header={
        <Header
          variant="h2"
          description={prompt?.description}
          // actions={
          //   <SpaceBetween direction="horizontal" size="xs">
          //     <Button>Share</Button>
          //     <Button>Rate</Button>
          //   </SpaceBetween>
          // }
        >
          {prompt?.name}{" "}
          <small>
            by {prompt?.owner_username ? prompt?.owner_username : "unknown"}
          </small>
        </Header>
      }
    >
      {prompt?.instruction}
    </Container>
  );
}
