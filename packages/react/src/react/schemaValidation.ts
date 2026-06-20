export type ImportMetaWithEnv = ImportMeta & {
  env?: {
    DEV?: boolean;
    PROD?: boolean;
  };
};

interface EnvironmentOptions {
  importMetaEnv?: ImportMetaWithEnv["env"] | null;
  nodeEnv?: string;
}

export function resolveSchemaValidationEnvironment({
  importMetaEnv,
  nodeEnv,
}: EnvironmentOptions): boolean {
  if (typeof importMetaEnv?.DEV === "boolean") {
    return importMetaEnv.DEV;
  }
  if (typeof importMetaEnv?.PROD === "boolean") {
    return !importMetaEnv.PROD;
  }

  return nodeEnv !== "production";
}
