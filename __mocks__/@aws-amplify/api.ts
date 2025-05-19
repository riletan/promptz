import { jest } from "@jest/globals";

export const copyPromptMutationMock = jest.fn();
export const copyProjectRuleMutationMock = jest.fn();
export const downloadProjectRuleMutationMock = jest.fn();

export const generateClient = jest.fn().mockReturnValue({
  mutations: {
    copyPrompt: copyPromptMutationMock,
    copyProjectRule: copyProjectRuleMutationMock,
    downloadProjectRule: downloadProjectRuleMutationMock,
  },
});
