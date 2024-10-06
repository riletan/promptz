"use client";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { useRouter } from "next/navigation";
import {
  BreadcrumbGroup,
  Button,
  ContentLayout,
  Header,
  Link,
} from "@cloudscape-design/components";
import PromptTable from "@/components/PromptCollection";
import header from "@cloudscape-design/components/header";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function Browse() {
  const router = useRouter();

  return (
    <ContentLayout
      defaultPadding
      headerVariant="high-contrast"
      maxContentWidth={1024}
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Promptz", href: "/" },
            { text: "Browse", href: "#" },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
      header={
        <Header
          variant="h1"
          info={<Link variant="info">Info</Link>}
          description="Discover the prompt community-driven prompt library for Amazon Q Developer."
          actions={
            <Button
              variant="primary"
              onClick={() => router.push("/prompt/create")}
            >
              Create Prompt
            </Button>
          }
        >
          Browse prompts
        </Header>
      }
    >
      <PromptTable />
    </ContentLayout>
  );
}
