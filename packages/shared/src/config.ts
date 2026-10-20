import { z } from "zod";

/** "true" | "false" -> boolean. Anything else is rejected (no silent truthiness). */
const boolFromString = z.enum(["true", "false"]).transform((v) => v === "true");

const urlWithProtocol = (protocols: RegExp) => z.url({ protocol: protocols });

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

    DATABASE_URL: urlWithProtocol(/^postgres(ql)?$/),
    REDIS_URL: urlWithProtocol(/^rediss?$/),

    API_HOST: z.string().min(1).default("0.0.0.0"),
    API_PORT: z.coerce.number().int().min(1).max(65535).default(3000),

    WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(500).default(20),

    /**
     * SSRF escape hatch. Lets the checker hit loopback/private addresses so that
     * integration tests can use local fake servers. Must never be enabled in production.
     */
    ALLOW_PRIVATE_TARGETS: boolFromString.default(false),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === "production" && env.ALLOW_PRIVATE_TARGETS) {
      ctx.addIssue({
        code: "custom",
        path: ["ALLOW_PRIVATE_TARGETS"],
        message: "must be false when NODE_ENV=production (SSRF protection)",
      });
    }
  });

export type Config = z.infer<typeof envSchema>;

export class ConfigError extends Error {
  constructor(public readonly problems: readonly string[]) {
    super(`Invalid configuration:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    this.name = "ConfigError";
  }
}

/**
 * Pure: validates a raw environment record and returns typed config.
 * Never reads process.env itself, so it is trivial to test.
 */
export function parseConfig(env: Record<string, string | undefined>): Config {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    throw new ConfigError(
      result.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    );
  }
  return result.data;
}

/** Convenience for app entrypoints. */
export function loadConfig(): Config {
  return parseConfig(process.env);
}
