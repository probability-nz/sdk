import { ProbProvider, useHashProps } from "@probability-nz/react";
import { Suspense } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Plugin } from "./Plugin";

export function App() {
  const hashProps = useHashProps();

  if (!hashProps) {
    return (
      <div>
        <h2>Error</h2>
        <pre>{`Invalid URL hash.\nExpected format: ${location.origin}${location.pathname}#{"doc":"automerge:...","sync":["wss://..."],"delegation":"..."}`}</pre>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ProbProvider sync={hashProps.sync}>
        <Suspense fallback={<p>Connecting...</p>}>
          <Plugin hashProps={hashProps} />
        </Suspense>
      </ProbProvider>
    </ErrorBoundary>
  );
}
