/**
 * Loads the WebGL scene chunk, retrying a failed fetch a couple of times
 * (a flaky network, or a tab asking for a chunk from before a redeploy).
 * If it still fails the caller quietly switches to the CSS book.
 */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function loadBookScene() {
  let lastError: unknown;
  for (const delay of [0, 500, 1500]) {
    if (delay) await wait(delay);
    try {
      return await import("./BookScene");
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
