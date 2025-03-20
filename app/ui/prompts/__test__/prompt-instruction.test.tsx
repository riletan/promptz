import PromptInstruction from "@/app/ui/prompts/prompt-instruction";
import { describe, expect, test } from "@jest/globals";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { Mail } from "lucide-react";

describe("PromptInstruction", () => {
  const defaultProps = {
    title: "Test Title",
    text: "Test description text",
    icon: Mail,
  };

  test("renders the prompt instruction with all provided props", () => {
    render(<PromptInstruction {...defaultProps} />);
    const { container } = render(<PromptInstruction {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});
