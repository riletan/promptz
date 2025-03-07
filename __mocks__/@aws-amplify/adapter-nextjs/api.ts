import { jest } from "@jest/globals";

export const mockPrompt = {
  id: "123",
  name: "Test Prompt",
  description: "Test Description",
  instruction: "Test Instruction",
  howto: "Test How To",
  tags: ["tag1", "tag2"],
  owner_username: "Test Author",
  owner: "author123",
  public: true,
  sourceURL: "https://example.com",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

export const getPromptMock = jest
  .fn()
  .mockReturnValue(Promise.resolve({ data: mockPrompt }));

export const generateServerClientUsingCookies = jest.fn().mockReturnValue({
  models: {
    prompt: {
      list: jest.fn(),
      get: getPromptMock,
    },
  },
});
