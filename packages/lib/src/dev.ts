declare const process: { env: { NODE_ENV?: string } } | undefined;

export const DEV = process?.env.NODE_ENV !== "production";
