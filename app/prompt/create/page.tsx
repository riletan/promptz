"use client";
import {
  BreadcrumbGroup,
  Button,
  Container,
  ContentLayout,
  Form,
  FormField,
  Header,
  Input,
  Link,
  SpaceBetween,
  Textarea,
} from "@cloudscape-design/components";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../../amplify/data/resource"; // Path to your backend resource definition
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchUserAttributes } from "aws-amplify/auth";

const client = generateClient<Schema>();

export default function CreatePrompt() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function createPrompt() {
    setLoading(true);
    const userAttributes = await fetchUserAttributes();
    const prompt = {
      name: name,
      description: description,
      createdBy: userAttributes.preferred_username
        ? userAttributes.preferred_username
        : "unknown",
    };
    const newPrompt = await client.models.prompt.create(prompt);

    if (newPrompt.data?.id) {
      const version = {
        promptId: newPrompt.data.id,
        number: 1,
        instruction: instruction,
      };

      await client.models.promptVersion.create(version);
      router.push("/");
    }
  }

  return (
    <ContentLayout
      defaultPadding
      headerVariant="high-contrast"
      maxContentWidth={1024}
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Promptz", href: "/" },
            { text: "Prompts & Prompt Templates", href: "/prompt" },
            { text: "Create", href: "#" },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
      header={
        <Header
          variant="h1"
          info={<Link variant="info">Info</Link>}
          description="Create a new prompt or prompt template"
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
                stretch
                description="A catchy name for your prompt."
                label="Name"
              >
                <Input
                  value={name}
                  onChange={({ detail }) => setName(detail.value)}
                />
              </FormField>
              <FormField
                stretch
                description="Describe the essence of your prompt in a few words."
                label={
                  <span>
                    Description <i>- optional</i>{" "}
                  </span>
                }
              >
                <Input
                  value={description}
                  onChange={({ detail }) => setDescription(detail.value)}
                />
              </FormField>
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
