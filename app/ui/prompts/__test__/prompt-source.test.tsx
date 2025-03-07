import { PromptSource } from "@/app/ui/prompts/prompt-source";
import { describe, expect, test } from "@jest/globals";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

describe("PromptSource", () => {
  test("renders the prompt form component unchanged", () => {
    const { container } = render(<PromptSource url="https://promptz.dev" />);
    expect(container).toMatchSnapshot();
  });
});
