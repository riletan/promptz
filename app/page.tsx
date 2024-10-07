"use client";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { useRouter } from "next/navigation";
import {
  Button,
  ContentLayout,
  Header,
  Link,
} from "@cloudscape-design/components";
import PromptCollection from "@/components/PromptCollection";

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
      <PromptCollection
        limit={3}
        promptsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 3 }]}
      />
    </ContentLayout>
  );
}
