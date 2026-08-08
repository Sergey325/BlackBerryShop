// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled: ["production", "preview"].includes(
      process.env.VERCEL_ENV ?? ""
  ),

  beforeSend(event, hint) {
    const error = hint.originalException;

    if (
        error instanceof Error &&
        (
            error.message.includes("window.webkit.messageHandlers") ||
            error.message.includes("Java object is gone")
        )
    ) {
      return null;
    }

    return event;
  },

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
