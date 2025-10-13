import { draftMode } from 'next/headers';

export async function GET(request: Request) {
  // Use 'await' here to resolve the promise returned by draftMode()
  const draft = await draftMode();

  // Now you can call .disable() on the resolved object
  draft.disable();

  return new Response('Draft mode is disabled');
}
