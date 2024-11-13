import { defineAuth, secret } from "@aws-amplify/backend";
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
    externalProviders: {
      google: {
        clientId: secret("GOOGLE_CLIENT_ID"),
        clientSecret: secret("GOOGLE_CLIENT_SECRET"),
        attributeMapping: {
          email: "email",
          emailVerified: "email_verified",
          preferredUsername: "name",
        },
        scopes: ["email", "openid", "profile"],
      },
      callbackUrls: ["http://localhost:3000/auth", "https://promptz.dev/auth"],
      logoutUrls: ["http://localhost:3000/", "https://promptz.dev/"],
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
    },
  },
});
