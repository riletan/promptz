"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { useRouter } from "next/navigation";
import {
  BreadcrumbGroup,
  Button,
  ContentLayout,
  Header,
} from "@cloudscape-design/components";
import { useAuth } from "@/contexts/AuthContext";
import DraftCollection from "@/components/DraftCollection";

Amplify.configure(outputs);

export default function Browse() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ContentLayout
      defaultPadding
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Promptz", href: "/" },
            { text: "My Drafts", href: "my" },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
      header={
        <Header
          variant="h1"
          description="This is a list of your current prompt drafts. Keep on prompting!"
          actions={
            <Button
              variant="primary"
              onClick={() => router.push("/prompt/create")}
            >
              Create Prompt
            </Button>
          }
        >
          Your Drafts
        </Header>
      }
    >
      {user && <DraftCollection />}
    </ContentLayout>
  );
}
