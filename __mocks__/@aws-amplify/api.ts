import { jest } from "@jest/globals";

export const publishPromptCopiedMock = jest.fn();
export const publishRuleCopiedMock = jest.fn();
export const publishRuleDownloadedMock = jest.fn();
export const publishPromptStarredMock = jest.fn();
export const publishPromptUnstarredMock = jest.fn();
export const createStarMock = jest.fn();
export const deleteStarMock = jest.fn();
export const generateClient = jest.fn().mockReturnValue({
  models: {
    stars: {
      create: createStarMock,
      delete: deleteStarMock,
    },
  },
  mutations: {
    publishPromptCopied: publishPromptCopiedMock,
    publishRuleCopied: publishRuleCopiedMock,
    publishPromptStarred: publishPromptStarredMock,
    publishPromptUnstarred: publishPromptUnstarredMock,
    publishRuleDownloaded: publishRuleDownloadedMock,
  },
});
