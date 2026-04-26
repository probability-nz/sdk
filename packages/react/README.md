# @probability-nz/react

React SDK for building [Probability](https://probability.nz) plugins.

Plugins are web apps that can help with gameplay, act as an AI opponent, manage decks, enforce rules, etc.

They're launched with a special URL:

```jsonc
// https://example.com/plugin#{"doc":"...","sync":["..."],"delegation":"..."}
{
  "doc": "automerge:11111111111111111...", // Document URI (game ID)
  "sync": [ "wss://sync.probability.nz" ], // Servers to use
  "delegation": "L0r3mIp5umD0lorS1tAm3t==" // Permissions https://github.com/inkandswitch/keyhive
}
```

Once the app loads, `<ProbProvider>` connects to the sync server. `useProbDocument` handles the game state, and `usePresenceState` shows moves and changes.

```mermaid
flowchart TD
    subgraph prob ["Probability app"]
        A["Launch plugin in new tab/iframe"]
    end

    A -- "<pre>https://example.com/plugin#{&quot;doc&quot;:&quot;...&quot;,&quot;sync&quot;:[&quot;...&quot;],&quot;delegation&quot;:&quot;...&quot;}</pre>" --> C{"URL has doc + sync?"}
    C -- "Yes" --> E["Wait for server/peers to share doc (sync server may not have a copy yet)"]
    C -- "No" --> Err1["Error [1]"]
    E -- "Loaded" --> Ready
    E -- "Timeout" --> Err2["Error [2]"]

    subgraph Ready ["Your plugin lives here"]
        direction LR
        R1["Read/write <code>doc</code> (shared game state)"]
        R2["Read peer <code>presence</code> states (eg other players' intended moves)"]
        R3["Write local <code>presence</code> state"]
    end

    R1 --> Err3["Error [3, 4, 5]"]
    R2 -.-> Warn["Warning [6]"]
    R3 --> Err4["Error [7]"]

    style Ready fill:#d4edda4d,stroke:#28a745
    classDef err fill:#f8d7da4d,stroke:#dc3545
    classDef warn fill:#fff3cd4d,stroke:#856d00
    class Err1,Err2,Err3,Err4 err
    class Warn warn
```

### Errors:

1. **`parseHashProps()`**: invalid or missing URL hash
2. **Automerge sync**: doc never loads (60s timeout). [WebSocket errors are silent.](https://github.com/automerge/automerge-repo/issues/208)
3. **`changeDoc()`**: doc schema validation failed
4. **`useProbDocument`**: document deleted by peer
5. **Doc update**: invalid mutation (eg `undefined`, non-serializable values)
6. ~~**Peer presence**: peer presence schema validation failed (`console.warn` in dev)~~ TODO
7. **`update()`**: local presence schema validation failed
