"use client";

import {
  SpaceBetween,
  Button,
  Container,
  Box,
  Spinner,
  Link,
  Cards,
  CardsProps,
  Badge,
  Icon,
} from "@cloudscape-design/components";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../amplify/data/resource";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PromptCollectionProps {
  limit?: number;
  promptsPerRow?: CardsProps.CardsLayout[];
}

const client = generateClient<Schema>();

export default function PromptCollection(props: PromptCollectionProps) {
  const router = useRouter();

  const [prompts, setPrompts] = useState<Array<Schema["prompt"]["type"]>>();
  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    const { data: prompts } = await client.models.prompt.list({
      limit: props.limit ?? 0,
    });
    if (prompts) {
      setPrompts(prompts);
    }
  };

  if (!prompts)
    return (
      <Container>
        <Box textAlign="center">
          <Spinner size="large" />
        </Box>
      </Container>
    );

  return (
    <Cards
      variant="container"
      cardDefinition={{
        header: (item) => (
          <SpaceBetween size="xs">
            <SpaceBetween size="xs" direction="horizontal">
              <Badge color="blue">{item.sdlc_phase?.toLocaleUpperCase()}</Badge>
              <Badge color="grey">{item.category?.toLocaleUpperCase()}</Badge>
            </SpaceBetween>
            <Link href={`/prompt/${item.id}`} fontSize="heading-s">
              {item.name}
            </Link>
          </SpaceBetween>
        ),
        sections: [
          {
            id: "owner_username",
            content: (item) => (
              <Box>
                <Icon name="user-profile" /> created by {item.owner_username}
              </Box>
            ),
          },
          {
            id: "description",
            content: (item) => item.description,
          },
        ],
      }}
      cardsPerRow={props.promptsPerRow ?? [{ cards: 1 }]}
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
