export function request(ctx) {
  return {
    operation: "PutEvents",
    events: [
      {
        source: "promptz.dev",
        detailType: "PromptCopied",
        detail: { ...ctx.args },
      },
    ],
  };
}

export function response(ctx) {
  return ctx.args;
}
