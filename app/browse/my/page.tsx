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
import { useAuth } from "@/contexts/AuthContext";

Amplify.configure(outputs);

export default function Browse() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ContentLayout
      defaultPadding
      headerVariant="high-contrast"
      maxContentWidth={1024}
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Promptz", href: "/" },
            { text: "Browse", href: "/browse" },
            { text: "My Prompts", href: "my" },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
      header={
        <Header
          variant="h1"
          description="This is a list of your amazing contributions of prompts. You are awesome!"
          actions={
            <Button
              variant="primary"
              onClick={() => router.push("/prompt/create")}
            >
              Create Prompt
            </Button>
          }
        >
          Your prompts
        </Header>
      }
    >
      {user && (
        <PromptCollection
          showLoadMore={true}
          limit={10}
          facets={[{ facet: "OWNER", value: user?.userId }]}
        />
      )}
    </ContentLayout>
  );
}
