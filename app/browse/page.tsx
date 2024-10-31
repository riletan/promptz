"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BreadcrumbGroup,
  Button,
  ContentLayout,
  Header,
} from "@cloudscape-design/components";
import PromptCollection from "@/components/PromptCollection";
import { Facets } from "@/repositories/PromptRepository";

Amplify.configure(outputs);

export default function Browse() {
  const searchParams = useSearchParams();

  const router = useRouter();

  const getInitialFacets = (): Array<Facets> => {
    const query = searchParams.get("query");
    if (query) {
      return [{ facet: "SEARCH", value: query }];
    }
    return [];
  };

  return (
    <ContentLayout
      defaultPadding
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
      <PromptCollection
        showLoadMore={true}
        showFilters={true}
        limit={50}
        promptsPerRow={[{ cards: 1 }, { minWidth: 800, cards: 4 }]}
        facets={getInitialFacets()}
      />
    </ContentLayout>
  );
}
