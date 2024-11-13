import { describe, it, expect } from "vitest";
import {
  PromptGraphQLRepository,
  Facets,
} from "../../repositories/PromptRepository";

describe("PromptGraphQLRepository", () => {
  describe("facetsToFilter", () => {
    const repository = new PromptGraphQLRepository();

    it("should return undefined when no facets are provided", () => {
      const result = repository["facetsToFilter"]();
      expect(result).toBeUndefined();
    });

    it("should return undefined when an empty array of facets is provided", () => {
      const result = repository["facetsToFilter"]([]);
      expect(result).toBeUndefined();
    });

    it("should handle search facets correctly", () => {
      const facets: Facets[] = [{ facet: "SEARCH", value: "test" }];
      const result = repository["facetsToFilter"](facets);
      expect(result).toEqual({
        or: [
          { name: { contains: "test" } },
          { name: { contains: "TEST" } },
          { name: { contains: "Test" } },
          { description: { contains: "test" } },
          { description: { contains: "TEST" } },
          { description: { contains: "Test" } },
        ],
      });
    });

    it("should handle non-search facets correctly", () => {
      const facets: Facets[] = [
        { facet: "CATEGORY", value: "AI" },
        { facet: "OWNER", value: "John" },
      ];
      const result = repository["facetsToFilter"](facets);
      expect(result).toEqual({
        and: [{ category: { eq: "AI" } }, { owner: { eq: "John" } }],
      });
    });

    it("should handle a single non-search facet correctly", () => {
      const facets: Facets[] = [{ facet: "CATEGORY", value: "AI" }];
      const result = repository["facetsToFilter"](facets);
      expect(result).toEqual({ category: { eq: "AI" } });
    });

    it("should handle a combination of search and non-search facets", () => {
      const facets: Facets[] = [
        { facet: "SEARCH", value: "test" },
        { facet: "CATEGORY", value: "AI" },
        { facet: "SDLC_PHASE", value: "Development" },
      ];
      const result = repository["facetsToFilter"](facets);
      expect(result).toEqual({
        and: [
          {
            or: [
              { name: { contains: "test" } },
              { name: { contains: "TEST" } },
              { name: { contains: "Test" } },
              { description: { contains: "test" } },
              { description: { contains: "TEST" } },
              { description: { contains: "Test" } },
            ],
          },
          { category: { eq: "AI" } },
          { sdlc_phase: { eq: "Development" } },
        ],
      });
    });

    it("should handle a single search facet correctly", () => {
      const facets: Facets[] = [{ facet: "SEARCH", value: "test" }];
      const result = repository["facetsToFilter"](facets);
      expect(result).toEqual({
        or: [
          { name: { contains: "test" } },
          { name: { contains: "TEST" } },
          { name: { contains: "Test" } },
          { description: { contains: "test" } },
          { description: { contains: "TEST" } },
          { description: { contains: "Test" } },
        ],
      });
    });
  });
});
