// components/Logout.tsx

"use client";

import {
  SpaceBetween,
  Button,
  Container,
  Header,
  Box,
  CopyToClipboard,
  Spinner,
  Badge,
  Link,
  Icon,
  Alert,
} from "@cloudscape-design/components";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { usePrompt } from "@/hooks/usePrompt";

interface PromptProps {
  promptId: string;
}

export default function Prompt(props: PromptProps) {
  const router = useRouter();
  const { promptViewModel, error, loading } = usePrompt(props.promptId);
  const { userViewModel } = useUser();

  if (loading)
    return (
      <Container data-testing="loading">
        <Box textAlign="center">
          <Spinner size="large" />
        </Box>
      </Container>
    );

  if (error)
    return (
      <Alert statusIconAriaLabel="Error" type="error" header={error.name} data-testing="error">
        {error.message}
      </Alert>
    );

  if (promptViewModel)
    return (
      <Container
        header={
          <Header
            variant="h2"
            description={promptViewModel.description}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <CopyToClipboard
                  copyButtonText="Copy"
                  copyErrorText="Prompt failed to copy"
                  copySuccessText=" Prompt copied. Now, go build!"
                  textToCopy={promptViewModel.instruction}
                />
                {userViewModel && promptViewModel.isOwnedBy(userViewModel) ? (
                  <Button variant="primary" onClick={() => router.push(`/prompt/${promptViewModel.id}/edit`)}>
                    Edit
                  </Button>
                ) : (
                  ""
                )}
              </SpaceBetween>
            }
          >
            <Link href="#" fontSize="heading-s">
              {promptViewModel.name}
            </Link>
          </Header>
        }
        footer={
          <SpaceBetween size="xs" direction="horizontal">
            <Box float="left">
              <Icon name="user-profile" /> {promptViewModel.createdBy()}
            </Box>
          </SpaceBetween>
        }
      >
        <pre className="wrap">{promptViewModel.instruction}</pre>
        <SpaceBetween alignItems="start" direction="horizontal" size="xs">
          <Badge color="blue">{promptViewModel.sdlcPhase}</Badge>
          <Badge color="grey">{promptViewModel.category}</Badge>
        </SpaceBetween>
      </Container>
    );
}
