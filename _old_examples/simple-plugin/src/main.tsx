import { parseHashContext } from "@probability-nz/plugins";
import { ProbProvider, usePresenceState, useProbDocument } from "@probability-nz/plugins/react";
import { Component, type ReactNode, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import type { AutomergeUrl } from "@probability-nz/types";
import type { AnyDocumentId } from "@automerge/react";

// --- Error boundary ---

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
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

function Plugin({ doc: docUrl }: { doc: AutomergeUrl }) {
  const docId = docUrl as unknown as AnyDocumentId;
  const [doc, changeDoc] = useProbDocument<{ count?: number }>(docId);
  const { state, setState, peers } = usePresenceState(docId);

  return (
    <div style={{ padding: 24, fontFamily: "monospace" }}>
      <h2>Debug Plugin</h2>

      <section>
        <h3>Document</h3>
        <pre>{JSON.stringify(doc, null, 2)}</pre>
        <button
          onClick={() =>
            changeDoc((d) => {
              d.count = (d.count ?? 0) + 1;
            })
          }
        >
          Increment count
        </button>
      </section>

      <section>
        <h3>Presence</h3>
        <p>Local: {JSON.stringify(state)}</p>
        <button
          onClick={() =>
            setState({
              cursor: {
                action: "focus",
                path: [`${Date.now()}@debug`],
              },
            })
          }
        >
          Set random cursor
        </button>
      </section>

      <section>
        <h3>Peers ({Object.keys(peers).length})</h3>
        <ul>
          {Object.entries(peers).map(([id, peer]) => (
            <li key={id}>
              {id}: {JSON.stringify(peer.state)} (active{" "}
              {new Date(peer.lastActiveAt).toLocaleTimeString()})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// --- App ---

const context = parseHashContext(location.hash);

function App() {
  if (!context) {
    return (
      <div style={{ padding: 24, color: "#e55" }}>
        <h2>Error</h2>
        <pre>
          No context found in URL hash. Expected format:{"\n"}
          {`#${JSON.stringify({ context: { doc: "automerge:...", sync: ["wss://..."] } })}`}
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
