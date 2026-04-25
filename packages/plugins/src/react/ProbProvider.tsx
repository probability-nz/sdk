import { type ReactNode, useContext, useState } from "react";
import { Repo, RepoContext, WebSocketClientAdapter } from "@automerge/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

declare const process: { env: { NODE_ENV?: string } };

/** @group Core */
export interface ProbProviderProps {
  /** WebSocket sync server URLs. */
  sync?: string[];
  children: ReactNode;
}

/**
 * Wrap your plugin to enable document sync and SDK hooks.
 * @group Core
 */
export function ProbProvider({ sync = [], children }: ProbProviderProps) {
  // Warn on nesting (always call hook to satisfy rules of hooks)
  const parent = useContext(RepoContext);
  if (process.env.NODE_ENV !== "production" && parent) {
    console.warn("Nested <ProbProvider> detected. This creates a separate Repo instance.");
  }

  const [queryClient] = useState(() => new QueryClient());
  const [repo] = useState(
    () =>
      new Repo({
        network: [...new Set(sync)].map((url) => new WebSocketClientAdapter(url)),
        isEphemeral: true,
      }),
  );

  // eslint-disable-next-line no-warning-comments
  // TODO: Uncomment once https://github.com/automerge/automerge-repo/blob/main/packages/automerge-repo-network-websocket/src/WebSocketClientAdapter.ts#L156 no longer throws on a second disconnect.
  // eslint-disable-next-line capitalized-comments
  // useEffect(() => () => void repo.shutdown(), [repo]);

  return (
    <QueryClientProvider client={queryClient}>
      <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>
    </QueryClientProvider>
  );
}
