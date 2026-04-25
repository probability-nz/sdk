import { useSuspenseQuery } from "@tanstack/react-query";
import { SCHEMA_URL } from "@probability-nz/types";
import analogSchema from "@probability-nz/types/analog.json" with { type: "json" };

/** @internal */
function fetchSchema(url: string): Promise<typeof analogSchema> {
  if (url === SCHEMA_URL) {
    return Promise.resolve(analogSchema);
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
