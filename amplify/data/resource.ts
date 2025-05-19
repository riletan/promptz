import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postAuthenticationFunction } from "../auth/post-authentication/resource";
const schema = a
  .schema({
    promptSearchResult: a.customType({
      id: a.id(),
      name: a.string(),
      tags: a.string().array(),
      slug: a.string(),
      description: a.string(),
      createdAt: a.string(),
      updatedAt: a.string(),
    }),
    paginatedPrompts: a.customType({
      prompts: a.ref("promptSearchResult").array(),
      nextToken: a.string(),
    }),

    user: a
      .model({
        id: a
          .id()
          .authorization((allow) => [
            allow.publicApiKey().to(["read"]),
            allow.owner().to(["read"]),
          ]),
        username: a.string(),
        email: a.string(),
        displayName: a
          .string()
          .authorization((allow) => [
            allow.publicApiKey().to(["read"]),
            allow.owner().to(["read"]),
          ]),
        owner: a.string(),
        prompts: a
          .hasMany("prompt", "owner")
          .authorization((allow) => [allow.owner().to(["read"])]),
      })
      .disableOperations(["subscriptions", "delete", "update"])
      .authorization((allow) => [allow.owner().to(["read"])]),
    prompt: a
      .model({
        id: a.id().required(),
        name: a.string().required(),
        slug: a.string(),
        description: a.string().required(),
        tags: a.string().array(),
        instruction: a.string().required(),
        sourceURL: a.string(),
        howto: a.string(),
        public: a.boolean(),
        owner: a.string().required(),
        author: a
          .belongsTo("user", "owner")
          .authorization((allow) => [allow.publicApiKey().to(["read"])]),
        copyCount: a.integer().default(0),
      })
      .secondaryIndexes((index) => [
        index("slug").queryField("listBySlug").name("slugIndex"),
        index("name").queryField("listByName").name("nameIndex"),
      ])
      .authorization((allow) => [
        allow.publicApiKey().to(["read"]),
        allow.authenticated().to(["read"]),
        allow.owner().to(["delete"]),
      ])
      .disableOperations(["subscriptions", "create", "update", "list"]),
    savePrompt: a
      .mutation()
      .arguments({
        id: a.id(),
        name: a.string().required(),
        description: a.string().required(),
        howto: a.string(),
        instruction: a.string().required(),
        tags: a.string().array(),
        public: a.boolean(),
        sourceURL: a.string(),
      })
      .returns(a.ref("prompt"))
      .authorization((allow) => [allow.authenticated()])
      .handler(
        a.handler.custom({
          dataSource: a.ref("prompt"),
          entry: "./handler/savePrompt.js",
        }),
      ),
    copyPrompt: a
      .mutation()
      .arguments({
        id: a.id(),
      })
      .returns(a.ref("prompt"))
      .authorization((allow) => [allow.publicApiKey()])
      .handler(
        a.handler.custom({
          dataSource: a.ref("prompt"),
          entry: "./handler/incrementCopyCount.js",
        }),
      ),
    searchPrompts: a
      .query()
      .arguments({
        query: a.string(),
        tags: a.string().array(),
        nextToken: a.string(),
      })
      .returns(a.ref("paginatedPrompts"))
      .authorization((allow) => [allow.publicApiKey()])
      .handler(
        a.handler.custom({
          dataSource: a.ref("prompt"),
          entry: "./handler/searchPrompts.js",
        }),
      ),
    projectRule: a
      .model({
        id: a.id().required(),
        name: a.string().required(),
        slug: a.string().required(),
        description: a.string(),
        content: a.string().required(),
        tags: a.string().array(),
        public: a.boolean(),
        sourceURL: a.string(),
        owner_username: a.string().required(),
        copyCount: a.integer().default(0),
        downloadCount: a.integer().default(0),
      })
      .secondaryIndexes((index) => [
        index("slug").queryField("listRuleBySlug").name("slugIndex"),
        index("name").queryField("listRuleByName").name("nameIndex"),
      ])
      .authorization((allow) => [
        allow.publicApiKey().to(["read"]),
        allow.authenticated().to(["read"]),
        allow.owner().to(["create", "update", "delete"]),
      ]),
    RuleCopied: a.customType({
      ruleId: a.id().required(),
    }),
    RuleDownloaded: a.customType({
      ruleId: a.id().required(),
    }),
    publishRuleCopied: a
      .mutation()
      .arguments({
        ruleId: a.id().required(),
      })
      .returns(a.ref("RuleCopied"))
      .authorization((allow) => [allow.publicApiKey()])
      .handler(
        a.handler.custom({
          dataSource: "PromptzEventBusDataSource",
          entry: "./handler/publishRuleCopied.js",
        }),
      ),
    publishRuleDownloaded: a
      .mutation()
      .arguments({
        ruleId: a.id().required(),
      })
      .returns(a.ref("RuleDownloaded"))
      .authorization((allow) => [allow.publicApiKey()])
      .handler(
        a.handler.custom({
          dataSource: "PromptzEventBusDataSource",
          entry: "./handler/publishRuleDownloaded.js",
        }),
      ),
  })
  .authorization((allow) => [allow.resource(postAuthenticationFunction)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  name: "promptz",
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 90 },
  },
});
