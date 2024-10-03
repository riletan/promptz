"use client";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { useRouter } from "next/navigation";
import {
  AppLayout,
  Box,
  Button,
  Cards,
  Container,
  ContentLayout,
  Header,
  Link,
  SpaceBetween,
} from "@cloudscape-design/components";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const router = useRouter();

  return (
    <ContentLayout
      defaultPadding
      headerVariant="high-contrast"
      maxContentWidth={1024}
      header={
        <Header
          variant="h1"
          info={<Link variant="info">Info</Link>}
          description="Discover the latest created prompts for Amazon Q Developer"
          actions={<Button variant="primary">Create Prompt</Button>}
        >
          Latest Promptz
        </Header>
      }
    >
      <Cards
        ariaLabels={{
          itemSelectionLabel: (e, t) => `select ${t.name}`,
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
              header: "Description",
              content: (item) => item.description,
            },
            {
              id: "type",
              header: "Type",
              content: (item) => item.type,
            },
            {
              id: "size",
              header: "Size",
              content: (item) => item.size,
            },
          ],
        }}
        cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 2 }]}
        items={[]}
        loadingText="Loading resources"
        empty={
          <Container>
            <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
              <SpaceBetween size="m">
                <b>No prompts created yet</b>
                <Button>Be the first. Create a prompt.</Button>
              </SpaceBetween>
            </Box>
          </Container>
        }
      />
    </ContentLayout>
  );
}
