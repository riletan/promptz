"use client";
import {
  Button,
  Container,
  ContentLayout,
  Form,
  FormField,
  Header,
  Link,
  SpaceBetween,
  Textarea,
} from "@cloudscape-design/components";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../../amplify/data/resource"; // Path to your backend resource definition
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

const client = generateClient<Schema>();

export default function CreatePrompt() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [instruction, setInstruction] = useState("");

  function createPrompt() {
    setLoading(true);
    const prompt = {
      instruction: instruction,
    };
    client.models.prompt.create(prompt);
    router.push("/");
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
          description="Create a new prompt"
        >
          New Prompt
        </Header>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPrompt();
        }}
      >
        <Form
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                formAction="none"
                variant="link"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button variant="primary" formAction="submit" loading={loading}>
                Save prompt
              </Button>
            </SpaceBetween>
          }
        >
          <Container>
            <SpaceBetween direction="vertical" size="l">
              <FormField
                label="Instruction"
                description="The specific task you want Amazon Q Developer to perform."
                stretch
              >
                <Textarea
                  onChange={({ detail }) => setInstruction(detail.value)}
                  value={instruction}
                  ariaRequired
                  autoFocus
                  placeholder=""
                  spellcheck
                  rows={10}
                />
              </FormField>
            </SpaceBetween>
          </Container>
        </Form>
      </form>
    </ContentLayout>
  );
}
