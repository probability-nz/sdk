import {
  type HexColor,
  getPeerName,
  parseHashContext,
  toColor,
} from "@probability-nz/plugins";
import {
  ProbProvider,
  usePresenceState,
  useProbDocument,
} from "@probability-nz/plugins/react";
import {
  Component,
  type ReactNode,
  StrictMode,
  Suspense,
  useSyncExternalStore,
} from "react";
import { createRoot } from "react-dom/client";
import { useStore } from "@tanstack/react-store";
import type { AutomergeUrl, PresenceState } from "@probability-nz/types";
import { useRepo } from "@automerge/react";

interface DebugPresence extends PresenceState {
  client?: string;
  color?: HexColor;
}

// --- Error boundary ---

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: "#e55" }}>
          <h2>Error</h2>
          <pre>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Plugin ---

function Plugin({ doc: docId }: { doc: AutomergeUrl }) {
  const [doc] = useProbDocument<{ count?: number; $schema: string }>(docId);
  const { localState, update, peerStates } = usePresenceState<DebugPresence>(docId, {
    initialState: {},
  });
  const local = useStore(localState, (s) => s);
  const peers = peerStates.value;
  const localPeerId = useRepo().peerId;

  return (
    <div style={{ padding: 24, fontFamily: "monospace" }}>
      <header style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
        <h2 style={{ margin: 0 }}>Debug Plugin</h2>
        This is an example plugin for{" "}
        <a href={`https://prob.nz/play${location.hash}`}>prob.nz/play</a>
      </header>

      <h3>Presence</h3>
      <button
        onClick={() => {
          update(() => ({
            client: "example-plugin@0.0.0",
            color: toColor(Math.random().toString()),
          }));
        }}
      >
        Set local state
      </button>
      <pre>local: {JSON.stringify(local, null, 2)}</pre>
      <pre>peers: {JSON.stringify(peers, null, 2)}</pre>
      <pre>
        names/default colors:{" "}
        {JSON.stringify(
          [
            [localPeerId, getPeerName(localPeerId), toColor(localPeerId)],
            ...Object.keys(peers).map((k) => [k, getPeerName(k), toColor(k)]),
          ],
          null,
          2,
        )}
      </pre>

      <h3>Document</h3>
      <pre>{JSON.stringify(doc, null, 2)}</pre>
    </div>
  );
}

// --- App ---

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => {
    window.removeEventListener("hashchange", cb);
  };
};
const getHash = () => location.hash;

function App() {
  const hash = useSyncExternalStore(subscribeHash, getHash);
  const context = parseHashContext(hash);

  if (!context) {
    return (
      <div style={{ padding: 24, color: "#e55" }}>
        <h2>Error</h2>
        <pre>
          No context found in URL hash. Expected format:{"\n"}
          {`#${JSON.stringify({ doc: "automerge:...", sync: ["wss://..."] })}`}
        </pre>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ProbProvider sync={context.sync}>
        <Suspense fallback={<p>Connecting...</p>}>
          <Plugin doc={context.doc} />
        </Suspense>
      </ProbProvider>
    </ErrorBoundary>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
