import { defineAuth } from "@aws-amplify/backend";
import { verificationEmailTemplate } from "./email-templates";
/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Welcome to PROMPTZ!",
      verificationEmailBody: (createCode) =>
        verificationEmailTemplate(createCode),
    },
  },
  senders: {
    email: {
      fromEmail: "noreply@promptz.dev",
    },
  },
  userAttributes: {
    preferredUsername: {
      required: true,
      mutable: false,
    },
  },
});
