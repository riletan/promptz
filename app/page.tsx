"use client";

import "@aws-amplify/ui-react/styles.css";
import "./app.css";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

import {
  Box,
  Container,
  ContentLayout,
  Grid,
  Header,
  SpaceBetween,
} from "@cloudscape-design/components";
import PromptCollection from "@/components/PromptCollection";
import HomeHeader from "@/components/HomeHeader/HomeHeader";

Amplify.configure(outputs);

export default function App() {
  return (
    <ContentLayout
      defaultPadding
      disableOverlap
      headerVariant="high-contrast"
      maxContentWidth={1024}
      header={<HomeHeader />}
    >
      <Box margin={{ top: "xxl" }}>
        <SpaceBetween size="xxl">
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
                <strong>PROMPTZ</strong> is here to help you discover, create,
                and perfect your prompts for Amazon Q Developer for every step
                of the software development lifecycle.
              </Container>
            </div>
            <div>
              <Container
                header={
                  <Header variant="h2">Explore the Prompt Library </Header>
                }
              >
                Browse through a rich collection of prompts, categorized by the
                stages of the SDLC. From requirements gathering to code
                deployment.
              </Container>
            </div>
            <div>
              <Container header={<Header variant="h2">Create & Share </Header>}>
                Have a unique use case or a clever prompt trick? Share it with
                the community! Create new prompts and templates, so others can
                benefit from your expertise.
              </Container>
            </div>
          </Grid>
        </SpaceBetween>
      </Box>

      <Box textAlign="center" margin={{ top: "xxxl" }}>
        <h2>Prompt Spotlight</h2>
        <PromptCollection
          limit={3}
          promptsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 3 }]}
          showLoadMore={false}
          showFilters={false}
        />
      </Box>
    </ContentLayout>
  );
}
