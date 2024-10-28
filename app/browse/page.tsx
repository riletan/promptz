"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { useRouter } from "next/navigation";
import {
  BreadcrumbGroup,
  Button,
  ContentLayout,
  Header,
} from "@cloudscape-design/components";
import PromptCollection from "@/components/PromptCollection";

Amplify.configure(outputs);

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
          description="Discover the community-driven prompt library for Amazon Q Developer."
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
      <PromptCollection showLoadMore={true} limit={10} />
    </ContentLayout>
  );
}
