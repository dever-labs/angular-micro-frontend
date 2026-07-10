/**
 * The shared state contract for this application.
 *
 * Every micro-frontend that reads or writes shared state depends on this
 * interface — not on the broker internals. The broker is generic; this
 * interface is what gives it a shape.
 *
 * In a multi-repo setup, publish this file (or this whole library) as its
 * own npm package so all separate repos share the same contract.
 * In a monorepo, a local library like this one is sufficient.
 */
export interface AppState extends Record<string, unknown> {
  theme: string;
  token: string | null;
  uri: string | null;
  users: string[];
}
