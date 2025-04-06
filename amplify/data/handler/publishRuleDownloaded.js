export function request(ctx) {
  return {
    operation: "PutEvents",
    events: [
      {
        source: "promptz.dev",
        detailType: "RuleDownloaded",
        detail: { ...ctx.args },
      },
    ],
  };
}

export function response(ctx) {
  return ctx.args;
}
