import { describe, expect, test } from "@jest/globals";
import { links } from "@/app/ui/navigation/navigation";

describe("Navigation Links", () => {
  test("should contain all required navigation links", () => {
    // Check if the links array contains the expected links
    expect(links).toContainEqual({ name: "Prompts", href: "/prompts" });
    expect(links).toContainEqual({ name: "Rules", href: "/rules" });
    expect(links).toContainEqual({ name: "MCP Server", href: "/mcp" });
  });

  test("should have the correct number of links", () => {
    // Verify the total number of links
    expect(links.length).toBe(3);
  });
});
