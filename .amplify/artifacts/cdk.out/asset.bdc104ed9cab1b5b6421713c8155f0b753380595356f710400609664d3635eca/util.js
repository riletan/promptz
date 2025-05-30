"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.getEnv = getEnv),
  (exports.log = log),
  (exports.withRetries = withRetries),
  (exports.parseJsonPayload = parseJsonPayload);
function getEnv(name) {
  const value = process.env[name];
  if (!value)
    throw new Error(`The environment variable "${name}" is not defined`);
  return value;
}
function log(title, ...args) {
  console.log(
    "[provider-framework]",
    title,
    ...args.map((x) =>
      typeof x == "object" ? JSON.stringify(x, void 0, 2) : x,
    ),
  );
}
function withRetries(options, fn) {
  return async (...xs) => {
    let attempts = options.attempts,
      ms = options.sleep;
    for (;;)
      try {
        return await fn(...xs);
      } catch (e) {
        if (attempts-- <= 0) throw e;
        await sleep(Math.floor(Math.random() * ms)), (ms *= 2);
      }
  };
}
async function sleep(ms) {
  return new Promise((ok) => setTimeout(ok, ms));
}
function parseJsonPayload(payload) {
  const text = new TextDecoder().decode(Buffer.from(payload ?? ""));
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `return values from user-handlers must be JSON objects. got: "${text}"`,
    );
  }
}
