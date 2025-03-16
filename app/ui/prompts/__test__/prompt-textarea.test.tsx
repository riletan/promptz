import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import "@testing-library/jest-dom";
import { FormProvider, useForm } from "react-hook-form";
import { PromptTextarea } from "@/app/ui/prompts/prompt-textarea";

// Wrapper component to provide form context
function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("PromptTextarea", () => {
  const defaultProps = {
    name: "prompt",
    label: "Test Label",
    description: "Test Description",
  };

  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  it("renders with default props", () => {
    render(
      <TestWrapper>
        <PromptTextarea {...defaultProps} />
      </TestWrapper>,
    );

    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Type @ to mention..."),
    ).toBeInTheDocument();
  });

  it("shows mention popover when @ is typed", async () => {
    render(
      <TestWrapper>
        <PromptTextarea {...defaultProps} />
      </TestWrapper>,
    );

    const textarea = screen.getByRole("textbox");
    await fireEvent.input(textarea, { target: { value: "@" } });

    // Check if mention options are displayed
    await waitFor(
      () => {
        expect(screen.getByText("@workspace")).toBeInTheDocument();
        expect(screen.getByText("@folder")).toBeInTheDocument();
        expect(screen.getByText("@file")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it("inserts mention when option is selected", async () => {
    render(
      <TestWrapper>
        <PromptTextarea {...defaultProps} />
      </TestWrapper>,
    );

    const textarea = screen.getByRole("textbox");
    await fireEvent.input(textarea, { target: { value: "@" } });

    // Select @workspace option
    await waitFor(() => {
      const workspaceOption = screen.getByText("@workspace");
      fireEvent.click(workspaceOption);
    });

    // Check if the mention was inserted correctly
    expect(textarea).toHaveValue("@workspace ");
  });

  //     const TestComponent = () => {
  //       const methods = useForm({
  //         defaultValues: {
  //           prompt: "",
  //         },
  //       });

  //       const onSubmit = jest.fn();

  //       return (
  //         <FormProvider {...methods}>
  //           <form onSubmit={methods.handleSubmit(onSubmit)}>
  //             <PromptTextarea {...defaultProps} required />
  //             <button type="submit">Submit</button>
  //           </form>
  //         </FormProvider>
  //       );
  //     };

  //     render(<TestComponent />);

  //     const submitButton = screen.getByText("Submit");
  //     fireEvent.click(submitButton);

  //     // Check for validation error
  //     await waitFor(() => {
  //       expect(screen.getByText("This field is required")).toBeInTheDocument();
  //     });
  //   });
});
