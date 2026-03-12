import { describe, it, expect } from "vitest";
import { parseArgs } from "./cli.js";

describe("parseArgs", () => {
  it("should parse --yes flag", () => {
    expect(parseArgs(["--yes"]).yes).toBe(true);
    expect(parseArgs(["-y"]).yes).toBe(true);
  });

  it("should parse --name", () => {
    expect(parseArgs(["--name", "my-api"]).name).toBe("my-api");
  });

  it("should parse --database", () => {
    expect(parseArgs(["--database", "prisma"]).database).toBe("prisma");
  });

  it("should parse --db-provider", () => {
    expect(parseArgs(["--db-provider", "postgresql"]).dbProvider).toBe("postgresql");
  });

  it("should parse --docker", () => {
    expect(parseArgs(["--docker"]).docker).toBe(true);
  });

  it("should parse --no-docker", () => {
    expect(parseArgs(["--no-docker"]).docker).toBe(false);
  });

  it("should parse --swagger", () => {
    expect(parseArgs(["--swagger"]).swagger).toBe(true);
  });

  it("should parse --no-swagger", () => {
    expect(parseArgs(["--no-swagger"]).swagger).toBe(false);
  });

  it("should parse --package-manager", () => {
    expect(parseArgs(["--package-manager", "pnpm"]).packageManager).toBe("pnpm");
    expect(parseArgs(["--package-manager", "yarn"]).packageManager).toBe("yarn");
    expect(parseArgs(["--package-manager", "npm"]).packageManager).toBe("npm");
  });

  it("should combine multiple flags", () => {
    const args = parseArgs([
      "--yes",
      "--name",
      "my-api",
      "--database",
      "drizzle",
      "--db-provider",
      "mysql",
      "--docker",
      "--package-manager",
      "pnpm",
    ]);

    expect(args.yes).toBe(true);
    expect(args.name).toBe("my-api");
    expect(args.database).toBe("drizzle");
    expect(args.dbProvider).toBe("mysql");
    expect(args.docker).toBe(true);
    expect(args.packageManager).toBe("pnpm");
  });

  it("should default to non-yes mode", () => {
    expect(parseArgs([]).yes).toBe(false);
  });

  it("should not set packageManager when not provided", () => {
    expect(parseArgs([]).packageManager).toBeUndefined();
  });
});
