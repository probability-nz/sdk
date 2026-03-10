import { useSuspenseQuery } from "@tanstack/react-query";

const SCHEMA_URL = "https://schema.probability.nz/v1/schema.json";

// TODO: Replace with real generated schema JSON
const HARDCODED_SCHEMA = {};

/** @internal */
function fetchSchema(url: string): Promise<unknown> {
  if (url === SCHEMA_URL) {
    return Promise.resolve(HARDCODED_SCHEMA);
  }
  throw new Error(`Unknown schema: ${url}`);
}

/** Fetch and cache a JSON schema by URL. Suspends until loaded. */
export function useSchema(url: string) {
  const { data } = useSuspenseQuery({
    queryKey: ["prob-schema", url],
    queryFn: () => fetchSchema(url),
    staleTime: Infinity,
  });
  return data;
}
