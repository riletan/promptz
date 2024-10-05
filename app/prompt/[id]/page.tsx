"use client";
import Prompt from "@/components/Prompt";
import {
  BreadcrumbGroup,
  ContentLayout,
  Header,
  Link,
} from "@cloudscape-design/components";

export default function ViewPrompt({ params }: { params: { id: string } }) {
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
            { text: `${params.id.substring(0, 7)}...`, href: `/${params.id}` },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
      //   header={
      //     <Header
      //       variant="h1"
      //       info={<Link variant="info">Info</Link>}
      //       description="Engineer your prompts"
      //     >
      //       Edit your Prompt
      //     </Header>
      //   }
    >
      <Prompt promptId={params.id} />
    </ContentLayout>
  );
}
