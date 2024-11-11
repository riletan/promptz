"use client";

import {
  SpaceBetween,
  Button,
  Container,
  Box,
  Link,
  Cards,
  CardsProps,
  Badge,
} from "@cloudscape-design/components";

import router from "next/router";
import { useDraftCollection } from "@/hooks/useDraftCollection";

interface PromptCollectionProps {
  promptsPerRow?: CardsProps.CardsLayout[];
}

export default function DraftCollection(props: PromptCollectionProps) {
  const { drafts } = useDraftCollection();

  return (
    <SpaceBetween size="s">
      <Cards
        variant="full-page"
        cardDefinition={{
          header: (item) => (
            <SpaceBetween size="xs">
              <SpaceBetween size="xs" direction="horizontal">
                <Badge color="blue">{item.sdlcPhase}</Badge>
                <Badge color="grey">{item.category}</Badge>
              </SpaceBetween>
              <Link href={`/prompt/${item.id}/edit`} fontSize="heading-s">
                {item.name}
              </Link>
            </SpaceBetween>
          ),
          sections: [
            {
              id: "description",
              content: (item) => item.description,
            },
          ],
        }}
        cardsPerRow={props.promptsPerRow ?? [{ cards: 1 }]}
        items={drafts}
        // loading={loading}
        loadingText="Loading a world of prompts"
        empty={
          <Container>
            <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
              <SpaceBetween size="m">
                <b>No drafts created yet</b>
                <Button
                  data-testid="button-create"
                  onClick={() => router.push("/prompt/create")}
                >
                  Wanna change this? Create a prompt.
                </Button>
              </SpaceBetween>
            </Box>
          </Container>
        }
      />
    </SpaceBetween>
  );
}
