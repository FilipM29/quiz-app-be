export const messages = {
  created: (resource: string, id: string) => `New ${resource} ${id} created!`,
  notFound: (resource: string, id?: string) =>
    `${resource} ${id ?? ''} not found!`,
  deleted: (resource: string) => `${resource} deleted!`,
  verified: (resource: string) => `${resource} verified!`,
  verificationFail: (resource: string) => `${resource} verification failed!`,
  validationFail: (resource: string) => `${resource} validation failed!`,
  timeout: (resource: string, id: string) => `${resource}: ${id} timeout!`,
  invalidSortField: () => 'Invalid sort field name!',
  internalServerError: () => 'Internal server error!',
  authRequired: () => 'Authentication required!',
  stripeSignatureErr: () => 'Invalid stripe signature!',
  stripeUnhandledEvent: (event: string) => `Unhandled Stripe ${event} event!`,
  notFilled: (resource: string, id: string) =>
    `Mandatory ${resource} ${id} not filled!`,
  incorrectAmount: (
    resource: string,
    expected: string | number,
    received: string | number
  ) => `${resource} expected ${expected} but received ${received}!`,
  saved: (resource: string) => `${resource} saved!`,
  message: 'Notification with message sent!',
  followed: (id: string) => `User ${id} followed!`,
  unfollowed: (id: string) => `User ${id} unfollowed!`,
  favorite: (action: boolean) => `${action ? 'Added' : 'Removed'} favourite!`,
  notEnoughCredits: (creditsYouNeed: number, creditsYouHave: number) =>
    `Not enough credits (${creditsYouHave}), to boots this offer you will need ${creditsYouNeed} credits.`
};
