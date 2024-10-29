"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { useRouter } from "next/navigation";
import {
  Button,
  Container,
  ContentLayout,
  Grid,
  Header,
  SpaceBetween,
} from "@cloudscape-design/components";
import PromptCollection from "@/components/PromptCollection";

Amplify.configure(outputs);

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
        <Grid
          gridDefinition={[
            { colspan: { xxs: 12, xs: 12, s: 4, m: 4, xl: 4 } },
            { colspan: { xxs: 12, xs: 12, s: 4, m: 4, xl: 4 } },
            { colspan: { xxs: 12, xs: 12, s: 4, m: 4, xl: 4 } },
          ]}
        >
          <div>
            <Container
              header={<Header variant="h2">One home for all prompts</Header>}
            >
              <strong>PROMPTZ</strong> is here to help you discover, create, and
              perfect your prompts for Amazon Q Developer for every step of the
              software development lifecycle.
            </Container>
          </div>
          <div>
            <Container
              header={<Header variant="h2">Explore the Prompt Library </Header>}
            >
              Browse through a rich collection of prompts, categorized by the
              stages of the SDLC. From requirements gathering to code
              deployment.
            </Container>
          </div>
          <div>
            <Container header={<Header variant="h2">Create & Share </Header>}>
              Have a unique use case or a clever prompt trick? Share it with the
              community! Create new prompts and templates, so others can benefit
              from your expertise.
            </Container>
          </div>
        </Grid>
      </SpaceBetween>
      <h2>Discover the latest prompts</h2>
      <PromptCollection
        limit={3}
        promptsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 3 }]}
        showLoadMore={false}
        showFilters={false}
      />
    </ContentLayout>
  );
}
