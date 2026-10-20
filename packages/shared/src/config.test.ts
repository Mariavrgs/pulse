import { describe, expect, it } from "vitest";
import { ConfigError, parseConfig } from "./config.js";

const valid = {
  DATABASE_URL: "postgresql://pulse:pulse@localhost:5432/pulse",
  REDIS_URL: "redis://localhost:6379",
};

describe("parseConfig", () => {
  it("applies safe defaults", () => {
    const cfg = parseConfig(valid);
    expect(cfg.NODE_ENV).toBe("development");
    expect(cfg.API_PORT).toBe(3000);
    expect(cfg.WORKER_CONCURRENCY).toBe(20);
    expect(cfg.ALLOW_PRIVATE_TARGETS).toBe(false);
  });

  it("coerces numeric and boolean strings", () => {
    const cfg = parseConfig({
      ...valid,
      API_PORT: "8080",
      WORKER_CONCURRENCY: "5",
      ALLOW_PRIVATE_TARGETS: "true",
      NODE_ENV: "test",
    });
    expect(cfg.API_PORT).toBe(8080);
    expect(cfg.WORKER_CONCURRENCY).toBe(5);
    expect(cfg.ALLOW_PRIVATE_TARGETS).toBe(true);
  });

  it("fails when required variables are missing, listing each problem", () => {
    try {
      parseConfig({});
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigError);
      const problems = (err as ConfigError).problems.join("\n");
      expect(problems).toContain("DATABASE_URL");
      expect(problems).toContain("REDIS_URL");
    }
  });

  it("rejects wrong URL protocols", () => {
    expect(() => parseConfig({ ...valid, DATABASE_URL: "http://localhost/db" })).toThrow(
      ConfigError,
    );
    expect(() => parseConfig({ ...valid, REDIS_URL: "postgres://localhost" })).toThrow(ConfigError);
  });

  it("rejects out-of-range ports and non-boolean flags", () => {
    expect(() => parseConfig({ ...valid, API_PORT: "70000" })).toThrow(ConfigError);
    expect(() => parseConfig({ ...valid, ALLOW_PRIVATE_TARGETS: "yes" })).toThrow(ConfigError);
  });

  it("refuses ALLOW_PRIVATE_TARGETS=true in production", () => {
    expect(() =>
      parseConfig({ ...valid, NODE_ENV: "production", ALLOW_PRIVATE_TARGETS: "true" }),
    ).toThrow(/ALLOW_PRIVATE_TARGETS/);
  });

  it("accepts production with the SSRF guard on", () => {
    const cfg = parseConfig({ ...valid, NODE_ENV: "production" });
    expect(cfg.ALLOW_PRIVATE_TARGETS).toBe(false);
  });
});
