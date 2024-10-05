"use client";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Cards,
  Container,
  ContentLayout,
  Header,
  Link,
  SpaceBetween,
} from "@cloudscape-design/components";
import { useEffect, useState } from "react";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const router = useRouter();

  const [prompts, setPrompts] = useState<Array<Schema["prompt"]["type"]>>([]);

  useEffect(() => {
    fetchLatestPrompts();
  }, []);

  async function fetchLatestPrompts() {
    try {
      const { data } = await client.models.prompt.list({
        limit: 3,
      });
      setPrompts(data);
    } catch (error) {
      console.error("Error fetching prompts:", error);
    }
  }

  return (
    <ContentLayout
      defaultPadding
      headerVariant="high-contrast"
      maxContentWidth={1024}
      header={
        <Header
          variant="h1"
          info={<Link variant="info">Info</Link>}
          description="Discover the latest created prompts and prompt templates for Amazon Q Developer."
          actions={
            <Button
              variant="primary"
              onClick={() => router.push("/prompt/create")}
            >
              Create Prompt
            </Button>
          }
        >
          Latest Promptz
        </Header>
      }
    >
      <Cards
        ariaLabels={{
          itemSelectionLabel: (e, t) => `select ${t.id}`,
          selectionGroupLabel: "Item selection",
        }}
        cardDefinition={{
          header: (item) => (
            <Link href="#" fontSize="heading-m">
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
        cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 3 }]}
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
    </ContentLayout>
  );
}
