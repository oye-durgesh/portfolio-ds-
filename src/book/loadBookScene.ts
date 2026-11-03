/**
 * Loads the 3D scene chunk. After a redeploy an open tab can still ask for
 * the previous chunk name; reload once to pick up the new one, then give up
 * and let the error boundary show the 2D story.
 */
const KEY = "book-scene-reloaded";

export function loadBookScene() {
  return import("./BookScene")
    .then((mod) => {
      sessionStorage.removeItem(KEY);
      return mod;
    })
    .catch((err: unknown) => {
      if (!sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, "1");
        window.location.reload();
        return new Promise<never>(() => {});
      }
      throw err;
    });
}
