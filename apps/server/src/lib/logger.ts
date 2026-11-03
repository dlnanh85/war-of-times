// The one place that writes to the console, so the output target can change later in one spot.
export const logger = {
  info: (...args: unknown[]) => console.info("[info]", ...args),
  warn: (...args: unknown[]) => console.warn("[warn]", ...args),
  error: (...args: unknown[]) => console.error("[error]", ...args),
};
