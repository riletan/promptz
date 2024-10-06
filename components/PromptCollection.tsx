// components/Logout.tsx

"use client";

import {
  SpaceBetween,
  Button,
  Container,
  Box,
  Spinner,
  Link,
  Cards,
} from "@cloudscape-design/components";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../amplify/data/resource";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PromptProps {}

const client = generateClient<Schema>();

export default function PromptTable(props: PromptProps) {
  const router = useRouter();

  const [prompts, setPrompts] = useState<Array<Schema["prompt"]["type"]>>([]);
  useEffect(() => {
    loadPrompts();
  });

  const loadPrompts = async () => {
    const { data: prompts } = await client.models.prompt.list();
    if (prompts) {
      setPrompts(prompts);
    }
  };

  if (prompts.length === 0)
    return (
      <Container>
        <Box textAlign="center">
          <Spinner size="large" />
        </Box>
      </Container>
    );

  return (
    <Cards
      variant="full-page"
      cardDefinition={{
        header: (item) => (
          <Link href={`/prompt/${item.id}`} fontSize="heading-m">
            {item.name}
          </Link>
        ),
        sections: [
          {
            id: "description",
            content: (item) => item.description,
          },
          {
            id: "createdBy",
            header: "Created by",
            content: (item) => item.owner_username,
          },
        ],
      }}
      cardsPerRow={[{ cards: 1 }]}
      items={prompts}
      loadingText="Loading resources"
      empty={
        <Container>
          <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
            <SpaceBetween size="m">
              <b>No prompts created yet</b>
              <Button onClick={() => router.push("/prompt/create")}>
                Be the first. Create a prompt.
              </Button>
            </SpaceBetween>
          </Box>
        </Container>
      }
    />
  );
}
