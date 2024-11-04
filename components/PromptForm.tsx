// components/Logout.tsx

"use client";

import {
  Form,
  SpaceBetween,
  Button,
  Container,
  FormField,
  Input,
  Textarea,
  Tiles,
  RadioGroup,
  Box,
  Modal,
} from "@cloudscape-design/components";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PromptGraphQLRepository } from "@/repositories/PromptRepository";
import { useAuth } from "@/contexts/AuthContext";
import {
  PromptCategory,
  PromptViewModel,
  SdlcPhase,
  ValidationError,
} from "@/models/PromptViewModel";

interface PromptFormProps {
  prompt: PromptViewModel;
}

interface FormData {
  id: string;
  name: string;
  description: string;
  instruction: string;
  sdlcPhase: string;
  category: string;
}

const repository = new PromptGraphQLRepository();

export default function PromptForm(props: PromptFormProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [formError, setFormError] = useState("");
  const [formFieldError, setFormFieldError] = useState<Array<ValidationError>>(
    [],
  );
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    id: props.prompt.id,
    name: props.prompt.name,
    description: props.prompt.description,
    instruction: props.prompt.instruction,
    sdlcPhase: props.prompt.sdlcPhase,
    category: props.prompt.category,
  } as FormData);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setFormError("");
      setFormFieldError([]);

      const editedPrompt = props.prompt.copy();
      editedPrompt.name = formData.name;
      editedPrompt.description = formData.description;
      editedPrompt.instruction = formData.instruction;
      editedPrompt.sdlcPhase = formData.sdlcPhase as SdlcPhase;
      editedPrompt.category = formData.category as PromptCategory;

      const validationResult = editedPrompt.validate();
      if (!validationResult.isValid) {
        setFormError(
          "There are some validation issues with your input. Please check the form for for errors.",
        );
        setFormFieldError([
          ...validationResult.name.errors,
          ...validationResult.description.errors,
          ...validationResult.instruction.errors,
          ...validationResult.description.errors,
        ]);
        return;
      } else {
        if (editedPrompt.id === "") {
          await repository.createPrompt(editedPrompt, user!);
        } else {
          await repository.updatePrompt(editedPrompt);
        }

        router.back();
      }
    } catch (error) {
      console.error("Error creating/updating prompt:", error);
      setFormError(
        "An error occurred while saving the prompt. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const deletePrompt = async () => {
    await repository.deletePrompt(props.prompt);
    router.push("/browse/my");
  };

  const getFormFieldErrorText = (formfieldName: string) => {
    const error = formFieldError.find((e) => e.key === formfieldName);
    return error ? error.value : "";
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await handleSubmit();
      }}
    >
      <Form
        errorText={formError}
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              formAction="none"
              variant="link"
              onClick={() => router.back()}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              formAction="submit"
              loading={loading}
              data-testid="button-save"
            >
              Save prompt
            </Button>
          </SpaceBetween>
        }
        secondaryActions={
          props.prompt.id && (
            <Button
              formAction="none"
              variant="normal"
              iconName="remove"
              onClick={() => handleDelete()}
              data-testid="button-remove"
            >
              Delete prompt
            </Button>
          )
        }
      >
        <Container>
          <SpaceBetween direction="vertical" size="l">
            <FormField
              data-testid="formfield-name"
              stretch
              description="A catchy name for your prompt."
              label="Name"
              errorText={getFormFieldErrorText("name")}
            >
              <Input
                data-testid="input-name"
                value={formData.name}
                onChange={({ detail }) =>
                  setFormData({ ...formData, name: detail.value })
                }
              />
            </FormField>
            <FormField
              data-testid="formfield-description"
              stretch
              description="What is this prompt doing? What is the goal?"
              label="Description"
              errorText={getFormFieldErrorText("description")}
            >
              <Input
                data-testid="input-description"
                value={formData.description}
                onChange={({ detail }) =>
                  setFormData({ ...formData, description: detail.value })
                }
              />
            </FormField>
            <FormField
              data-testid="formfield-sdlc"
              label="Software Development Lifecycle (SDLC) Phase"
              description="Which phase of the SDLC does this prompt relate to?"
              stretch
            >
              <Tiles
                onChange={({ detail }) =>
                  setFormData({ ...formData, sdlcPhase: detail.value })
                }
                value={formData.sdlcPhase}
                items={[
                  {
                    label: "Plan",
                    description:
                      "Define project scope, objectives, and feasibility while estimating resources and timelines.",
                    value: SdlcPhase.PLAN,
                  },
                  {
                    label: "Requirements Analysis",
                    description:
                      "Gather, analyze, and document detailed software requirements.",
                    value: SdlcPhase.REQ,
                  },
                  {
                    label: "Design",
                    description:
                      "Create the software architecture, user interface, and system design based on the requirements.",
                    value: SdlcPhase.DESIGN,
                  },
                  {
                    label: "Implement",
                    description:
                      "Write, refactor, fix and review the actual code for the software according to design specifications.",
                    value: SdlcPhase.IMPLEMENT,
                  },
                  {
                    label: "Test",
                    description:
                      "Conduct various types of testing to identify and fix bugs, ensuring the software meets quality standards and requirements.",
                    value: SdlcPhase.TEST,
                  },
                  {
                    label: "Deploy",
                    description:
                      "Release the software to the production environment, including installation, configuration, and user training.",
                    value: SdlcPhase.DEPLOY,
                  },
                  {
                    label: "Maintain",
                    description:
                      "Monitor, update, and support the software post-deployment, addressing issues and implementing new features as needed.",
                    value: SdlcPhase.MAINTAIN,
                  },
                ]}
              />
            </FormField>
            <FormField
              data-testid="formfield-category"
              label="Prompt Category"
              description="Is this prompt related to Amazon Q Developer Chat, Dev Agent, or inline code completion?"
              stretch
            >
              <RadioGroup
                onChange={({ detail }) =>
                  setFormData({ ...formData, category: detail.value })
                }
                value={formData.category}
                items={[
                  { value: PromptCategory.CHAT, label: "Chat" },
                  { value: PromptCategory.DEV_AGENT, label: "Dev Agent" },
                  {
                    value: PromptCategory.INLINE,
                    label: "Inline Code Completion",
                  },
                ]}
              />
            </FormField>
            <FormField
              data-testid="formfield-instruction"
              label="Instruction"
              description="The specific task you want Amazon Q Developer to perform."
              stretch
              errorText={getFormFieldErrorText("instruction")}
            >
              <Textarea
                data-testid="textarea-instruction"
                onChange={({ detail }) =>
                  setFormData({ ...formData, instruction: detail.value })
                }
                value={formData.instruction}
                ariaRequired
                placeholder=""
                spellcheck
                rows={10}
              />
            </FormField>
          </SpaceBetween>
        </Container>
      </Form>

      <Modal
        onDismiss={() => setDeleteModalVisible(false)}
        visible={deleteModalVisible}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                data-testid="button-remove-cancel"
                onClick={() => setDeleteModalVisible(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={deletePrompt}
                data-testid="button-remove-confirm"
              >
                Yes, delete the prompt
              </Button>
            </SpaceBetween>
          </Box>
        }
        header="Delete prompt"
      >
        Permanently delete this prompt? This action cannot be undone.
      </Modal>
    </form>
  );
}
