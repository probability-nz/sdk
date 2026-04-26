# example-plugin

Minimal Probability plugin demonstrating `<ProbProvider>`, `useHashProps`, `useProbDocument`, and `usePresenceState`.

## Run

```sh
pnpm dev
```

Open `http://localhost:3020/#<hash>` where `<hash>` is a URL-encoded `HashProps` JSON:

```
http://localhost:3020/#{"doc":"automerge:...","sync":["wss://sync.probability.nz"]}
```

To get a valid hash: open [prob.nz/play](https://probability.nz/play), start a game, and copy the `automerge:...` doc value out of the address bar into the JSON above.

## Test

```sh
pnpm test:e2e
```

Creates a fresh doc on prob.nz/play, loads it in the example, and asserts the doc renders with no console errors.
