"use client";
import {
  Alert,
  Box,
  BreadcrumbGroup,
  Container,
  ContentLayout,
  Header,
  SpaceBetween,
  Spinner,
} from "@cloudscape-design/components";
import PromptForm from "@/components/PromptForm";
import { usePrompt } from "@/hooks/usePrompt";
import { useUser } from "@/hooks/useUser";

export default function EditPrompt({ params }: { params: { id: string } }) {
  const { promptViewModel, error, loading } = usePrompt(params.id);
  const { userViewModel } = useUser();

  return (
    <ContentLayout
      defaultPadding
      headerVariant="high-contrast"
      maxContentWidth={1024}
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Promptz", href: "/" },
            { text: "Prompts & Prompt Templates", href: "/browse" },
            { text: `${params.id.substring(0, 7)}...`, href: `/${params.id}` },
            { text: "Edit", href: "#" },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
      header={
        <Header variant="h1" description="Engineer your prompts">
          Edit your Prompt
        </Header>
      }
    >
      {loading && (
        <Container data-testing="loading">
          <Box textAlign="center">
            <Spinner size="large" />
          </Box>
        </Container>
      )}

      {error && (
        <SpaceBetween size="l" data-testing="error">
          <Alert statusIconAriaLabel="Error" type="error" header={error.name} data-testing="error">
            {error.message}
          </Alert>
        </SpaceBetween>
      )}

      {promptViewModel && userViewModel && <PromptForm prompt={promptViewModel} user={userViewModel} />}
    </ContentLayout>
  );
}
