import { DocProvider, RepoProvider, useDoc } from '@probability-nz/plugins';
import { getPeerName } from '@probability/utils';

function DocView() {
  const { doc, peerId, localPresence, peerStates } = useDoc();
  return (
    <>
      <h3>Document</h3>
      <pre>{JSON.stringify(doc, null, 2)}</pre>
      <h3>Local — {getPeerName(peerId)}</h3>
      <pre>{JSON.stringify(localPresence, null, 2)}</pre>
      <h3>Peers</h3>
      <pre>{JSON.stringify(peerStates.value, null, 2)}</pre>
    </>
  );
}

export function App() {
  return (
    <RepoProvider>
      <DocProvider>
        <DocView />
      </DocProvider>
    </RepoProvider>
  );
}
