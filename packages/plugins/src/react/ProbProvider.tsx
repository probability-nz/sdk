import { type ReactNode, useContext, useEffect, useState } from "react";
import { Repo, RepoContext, WebSocketClientAdapter } from "@automerge/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DEV } from "@probability-nz/lib";

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
  if (DEV && parent) {
    console.warn("Nested <ProbProvider> detected. This creates a separate Repo instance.");
  }

  const [queryClient] = useState(() => new QueryClient());
  const [repo] = useState(() => new Repo({ network: [], isEphemeral: true }));

  useEffect(
    () => () => {
      void repo.shutdown();
    },
    [repo],
  );

  useEffect(() => {
    const { networkSubsystem } = repo;
    const adapters = Array.from(new Set(sync), (url) => {
      const adapter = new WebSocketClientAdapter(url);
      networkSubsystem.addNetworkAdapter(adapter);
      return adapter;
    });
    return () => {
      adapters.forEach((a) => {
        networkSubsystem.removeNetworkAdapter(a);
      });
    };
  }, [repo, sync]);

  return (
    <QueryClientProvider client={queryClient}>
      <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>
    </QueryClientProvider>
  );
}
