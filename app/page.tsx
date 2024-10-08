"use client";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { useRouter } from "next/navigation";
import {
  Button,
  Container,
  ContentLayout,
  Header,
  Link,
  SpaceBetween,
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
          description="Your One-Stop Hub for Amazon Q Developer Prompts!"
          actions={
            <Button
              variant="primary"
              onClick={() => router.push("/prompt/create")}
            >
              Create Prompt
            </Button>
          }
        >
          <h1>Welcome to Promptz</h1>
        </Header>
      }
    >
      <SpaceBetween size="s">
        <Container>
          <h2>What you can do with PROMPTZ?</h2>
          <strong>PROMPTZ</strong> is here to help you discover, create, and
          perfect your prompts for every step of the software development
          lifecycle. Whether you're looking for inspiration, patterns, or best
          practices, you’ve come to the right place!
          <ul>
            <li>
              <strong>Explore the Prompt Library:</strong> Browse through a rich
              collection of prompts, categorized by the stages of the SDLC. From
              requirements gathering to code deployment, we’ve got examples that
              fit every use case.
            </li>
            <li>
              <strong>Create & Share Your Own Prompts:</strong> Have a unique
              use case or a clever prompt trick? Share it with the community!
              Create new prompts and templates, so others can benefit from your
              expertise.
            </li>
          </ul>
          <h2>Why should you give PROMPTZ a try?</h2>
          <p>
            It is more then just a prompt repository – <strong>PROMPTZ</strong>{" "}
            is a collaborative platform that empowers developers to leverage the
            full potential of Amazon Q Developer. So go ahead, explore the
            library, share your ideas, and see what the community has created.
          </p>
          <p>The perfect prompt is just a few clicks away!</p>
        </Container>
      </SpaceBetween>
      <h2>Discover the latest prompts</h2>
      <PromptCollection
        limit={3}
        promptsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 3 }]}
      />
    </ContentLayout>
  );
}
