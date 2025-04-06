export function request(ctx) {
  return {
    operation: "PutEvents",
    events: [
      {
        source: "promptz.dev",
        detailType: "PromptStarred",
        detail: { ...ctx.args },
      },
    ],
  };
}

export function response(ctx) {
  return ctx.args;
}
