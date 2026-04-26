import {
  type HashProps,
  getPeerName,
  toColor,
  usePresenceState,
  useProbDocument,
} from "@probability-nz/react";
import { useStore } from "@tanstack/react-store";
import { useRepo } from "@automerge/react";
import pkg from "../package.json" with { type: "json" };

const CLIENT = `${pkg.name}@${pkg.version}`;

export function Plugin({ hashProps }: { hashProps: HashProps }) {
  const docId = hashProps.doc;
  const [doc] = useProbDocument<{ count?: number; $schema: string }>(docId);
  const {
    localState,
    update: updateLocalState,
    peerStates: { value: peers },
  } = usePresenceState(docId, {
    initialState: {},
  });
  const local = useStore(localState, (s) => s);
  const { peerId } = useRepo();

  return (
    <div>
      <header>
        <h2>Example Plugin</h2>
        This is an example plugin for{" "}
        <a
          href={`https://prob.nz/play#${encodeURI(JSON.stringify(hashProps))}`}
        >
          prob.nz/play
        </a>
      </header>

      <h3>Presence</h3>
      <button
        onClick={() => {
          updateLocalState(() => ({
            client: CLIENT,
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
          [peerId, ...Object.keys(peers)].map((id) => [
            id,
            getPeerName(id),
            toColor(id),
          ]),
          null,
          2,
        )}
      </pre>

      <h3>Document</h3>
      <pre>{JSON.stringify(doc, null, 2)}</pre>
    </div>
  );
}
