import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateProject } from "./index.js";
import { existsSync, readFileSync, rmSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { GeneratorContext, ProjectConfig } from "../types.js";

function makeConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    name: "test-app",
    description: "A test app",
    author: "tester",
    database: "none",
    dbProvider: "postgresql",
    docker: false,
    swagger: false,
    git: false,
    install: false,
    packageManager: "npm",
    ...overrides,
  };
}

function generate(projectDir: string, overrides: Partial<ProjectConfig> = {}): void {
  generateProject({ config: makeConfig(overrides), projectDir });
}

function readFile(projectDir: string, path: string): string {
  return readFileSync(join(projectDir, path), "utf-8");
}

function readJson(projectDir: string, path: string): Record<string, unknown> {
  return JSON.parse(readFile(projectDir, path));
}

describe("generateProject", () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = join(tmpdir(), `pest-gen-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(projectDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(projectDir, { recursive: true, force: true });
  });

  describe("base project", () => {
    it("should generate all base files", () => {
      generate(projectDir);

      const expected = [
        "package.json", "tsconfig.json", "eslint.config.mjs",
        ".prettierrc", "jest.config.js", ".gitignore",
        ".env", ".env.example", "vercel.json",
        "src/app.ts", "src/server.ts",
        "src/routes/health.ts", "src/routes/tasks.ts",
        "src/middleware/error-handler.ts", "src/middleware/validate.ts", "src/middleware/rate-limit.ts",
        "src/config/env.ts", "src/lib/errors.ts", "src/lib/logger.ts",
        "tests/app.test.ts", "tests/tasks.test.ts",
        ".husky/pre-commit",
      ];
      for (const file of expected) {
        expect(existsSync(join(projectDir, file)), `missing: ${file}`).toBe(true);
      }
    });

    it("should make husky pre-commit executable", () => {
      generate(projectDir);

      const mode = statSync(join(projectDir, ".husky/pre-commit")).mode & 0o777;
      expect(mode & 0o111).toBeGreaterThan(0);
    });

    it("should point vercel.json to dist/server.js", () => {
      generate(projectDir);

      const vercel = readJson(projectDir, "vercel.json") as Record<string, Array<Record<string, string>>>;
      expect(vercel.builds[0].src).toBe("dist/server.js");
      expect(vercel.routes[0].dest).toBe("dist/server.js");
    });
  });

  describe("server template", () => {
    it("should include graceful shutdown handlers", () => {
      generate(projectDir);

      const server = readFile(projectDir, "src/server.ts");
      expect(server).toContain("SIGTERM");
      expect(server).toContain("SIGINT");
      expect(server).toContain("server.close");
      expect(server).toContain("logger.info");
      expect(server).not.toContain("console.log");
    });

    it("should not reference database init for non-database config", () => {
      generate(projectDir);

      const server = readFile(projectDir, "src/server.ts");
      expect(server).not.toContain("initializeDatabase");
    });

    it("should initialize database for typeorm", () => {
      generate(projectDir, { database: "typeorm", dbProvider: "postgresql" });

      const server = readFile(projectDir, "src/server.ts");
      expect(server).toContain("initializeDatabase");
      expect(server).toContain(".then(");
      expect(server).toContain(".catch(");
      expect(server).toContain("process.exit(1)");
    });

    it("should destroy typeorm datasource on shutdown", () => {
      generate(projectDir, { database: "typeorm", dbProvider: "postgresql" });

      const server = readFile(projectDir, "src/server.ts");
      expect(server).toContain("AppDataSource.destroy");
      expect(server).toContain("SIGTERM");
    });
  });

  describe("example route", () => {
    it("should generate in-memory variant for no database", () => {
      generate(projectDir);

      const route = readFile(projectDir, "src/routes/tasks.ts");
      expect(route).toContain("taskRouter");
      expect(route).toContain("NotFoundError");
      expect(route).toContain("validate");
      expect(route).not.toContain("prisma");
    });

    it("should generate prisma variant when database is prisma", () => {
      generate(projectDir, { database: "prisma" });

      const route = readFile(projectDir, "src/routes/tasks.ts");
      expect(route).toContain("prisma");
      expect(route).toContain("taskRouter");
    });

    it("should generate task route test only for no-database config", () => {
      generate(projectDir);
      expect(existsSync(join(projectDir, "tests/tasks.test.ts"))).toBe(true);
    });

    it("should not generate task route test when database is configured", () => {
      generate(projectDir, { database: "prisma" });
      expect(existsSync(join(projectDir, "tests/tasks.test.ts"))).toBe(false);
    });
  });

  describe("database generators", () => {
    describe("prisma", () => {
      it("should generate prisma schema without url", () => {
        generate(projectDir, { database: "prisma" });

        expect(existsSync(join(projectDir, "prisma/schema.prisma"))).toBe(true);
        const schema = readFile(projectDir, "prisma/schema.prisma");
        expect(schema).not.toContain("env(");
      });

      it("should generate prisma.config.ts with defineConfig", () => {
        generate(projectDir, { database: "prisma" });

        expect(existsSync(join(projectDir, "prisma.config.ts"))).toBe(true);
        const config = readFile(projectDir, "prisma.config.ts");
        expect(config).toContain("defineConfig");
        expect(config).toContain('env("DATABASE_URL")');
      });

      it("should generate prisma client singleton", () => {
        generate(projectDir, { database: "prisma" });

        expect(existsSync(join(projectDir, "src/lib/prisma.ts"))).toBe(true);
      });
    });

    describe("drizzle", () => {
      it("should generate drizzle config and schema files", () => {
        generate(projectDir, { database: "drizzle", dbProvider: "postgresql" });

        expect(existsSync(join(projectDir, "drizzle.config.ts"))).toBe(true);
        expect(existsSync(join(projectDir, "src/db/index.ts"))).toBe(true);
        expect(existsSync(join(projectDir, "src/db/schema.ts"))).toBe(true);
      });

      it("should use createPool for mysql driver", () => {
        generate(projectDir, { database: "drizzle", dbProvider: "mysql" });

        const dbIndex = readFile(projectDir, "src/db/index.ts");
        expect(dbIndex).toContain("createPool");
      });
    });

    describe("typeorm", () => {
      it("should generate data source and entity files", () => {
        generate(projectDir, { database: "typeorm", dbProvider: "postgresql" });

        expect(existsSync(join(projectDir, "src/db/data-source.ts"))).toBe(true);
        expect(existsSync(join(projectDir, "src/db/index.ts"))).toBe(true);
        expect(existsSync(join(projectDir, "src/db/entities/task.ts"))).toBe(true);
      });

      it("should enable decorator support in tsconfig", () => {
        generate(projectDir, { database: "typeorm", dbProvider: "postgresql" });

        const tsconfig = readJson(projectDir, "tsconfig.json") as { compilerOptions: Record<string, boolean> };
        expect(tsconfig.compilerOptions.experimentalDecorators).toBe(true);
        expect(tsconfig.compilerOptions.emitDecoratorMetadata).toBe(true);
      });

      it("should not use top-level getRepository call", () => {
        generate(projectDir, { database: "typeorm", dbProvider: "postgresql" });

        const route = readFile(projectDir, "src/routes/tasks.ts");
        const topLevelRepo = route.split("\n").find((l) => l.startsWith("const taskRepo"));
        expect(topLevelRepo).toBeUndefined();
        expect(route).toContain("getRepository(Task)");
      });
    });
  });

  describe("environment", () => {
    it("should include DATABASE_URL in .env when database is configured", () => {
      generate(projectDir, { database: "prisma", dbProvider: "postgresql" });

      expect(readFile(projectDir, ".env")).toContain("DATABASE_URL");
      expect(readFile(projectDir, "src/config/env.ts")).toContain("DATABASE_URL!");
    });

    it("should not include DATABASE_URL when no database", () => {
      generate(projectDir);

      expect(readFile(projectDir, ".env")).not.toContain("DATABASE_URL");
      expect(readFile(projectDir, "src/config/env.ts")).not.toContain("DATABASE_URL");
    });

    it("should provide sqlite DATABASE_URL fallback without required flag", () => {
      generate(projectDir, { database: "drizzle", dbProvider: "sqlite" });

      const envConfig = readFile(projectDir, "src/config/env.ts");
      expect(envConfig).toContain("DATABASE_URL");
      expect(envConfig).not.toContain("required");
      expect(envConfig).toContain("./dev.db");
    });

    it("should include rate limit env vars in .env", () => {
      generate(projectDir);

      const envFile = readFile(projectDir, ".env");
      expect(envFile).toContain("RATE_LIMIT_WINDOW_MS=900000");
      expect(envFile).toContain("RATE_LIMIT_MAX=100");
    });

    it("should validate rate limit and port env vars", () => {
      generate(projectDir);

      const envConfig = readFile(projectDir, "src/config/env.ts");
      expect(envConfig).toContain("isNaN(rateLimitWindowMs)");
      expect(envConfig).toContain("isNaN(rateLimitMax)");
      expect(envConfig).toContain("isNaN(port)");
      expect(envConfig).toContain("65535");
    });
  });

  describe("docker", () => {
    it("should not generate docker files when disabled", () => {
      generate(projectDir, { docker: false });

      expect(existsSync(join(projectDir, "Dockerfile"))).toBe(false);
      expect(existsSync(join(projectDir, "docker-compose.yml"))).toBe(false);
      expect(existsSync(join(projectDir, ".dockerignore"))).toBe(false);
    });

    it("should generate all docker files when enabled", () => {
      generate(projectDir, { docker: true });

      expect(existsSync(join(projectDir, "Dockerfile"))).toBe(true);
      expect(existsSync(join(projectDir, "docker-compose.yml"))).toBe(true);
      expect(existsSync(join(projectDir, ".dockerignore"))).toBe(true);
    });

    it("should include postgres service in docker-compose", () => {
      generate(projectDir, { database: "prisma", dbProvider: "postgresql", docker: true });

      const compose = readFile(projectDir, "docker-compose.yml");
      expect(compose).toContain("postgres:16-alpine");
      expect(compose).toContain("db:");
      expect(compose).toContain("@db:");
    });

    it("should not include db service for sqlite in docker-compose", () => {
      generate(projectDir, { database: "prisma", dbProvider: "sqlite", docker: true });

      const compose = readFile(projectDir, "docker-compose.yml");
      expect(compose).not.toContain("db:");
    });

    it("should mount volume for sqlite database in docker-compose", () => {
      generate(projectDir, { database: "drizzle", dbProvider: "sqlite", docker: true });

      const compose = readFile(projectDir, "docker-compose.yml");
      expect(compose).toContain("volumes:");
      expect(compose).toContain("./data:/app/data");
    });

    it("should use file: prefix for prisma sqlite DATABASE_URL in docker-compose", () => {
      generate(projectDir, { database: "prisma", dbProvider: "sqlite", docker: true });

      const compose = readFile(projectDir, "docker-compose.yml");
      expect(compose).toContain("file:/app/data/dev.db");
    });

    it("should not use file: prefix for drizzle sqlite DATABASE_URL in docker-compose", () => {
      generate(projectDir, { database: "drizzle", dbProvider: "sqlite", docker: true });

      const compose = readFile(projectDir, "docker-compose.yml");
      expect(compose).toContain('DATABASE_URL: "/app/data/dev.db"');
    });

    describe("prisma dockerfile", () => {
      it("should copy prisma files to production stage", () => {
        generate(projectDir, { database: "prisma", docker: true });

        const dockerfile = readFile(projectDir, "Dockerfile");
        expect(dockerfile).toContain("COPY --from=builder /app/prisma ./prisma");
        expect(dockerfile).toContain("COPY --from=builder /app/prisma.config.ts ./");
      });

      it("should run prisma generate after COPY", () => {
        generate(projectDir, { database: "prisma", docker: true });

        const dockerfile = readFile(projectDir, "Dockerfile");
        const copyIdx = dockerfile.indexOf("COPY . .");
        const prismaIdx = dockerfile.indexOf("prisma generate");
        expect(prismaIdx).toBeGreaterThan(copyIdx);
      });

      it("should use pnpm exec for prisma generate", () => {
        generate(projectDir, { database: "prisma", packageManager: "pnpm", docker: true });

        expect(readFile(projectDir, "Dockerfile")).toContain("pnpm exec prisma generate");
      });

      it("should use yarn for prisma generate", () => {
        generate(projectDir, { database: "prisma", packageManager: "yarn", docker: true });

        expect(readFile(projectDir, "Dockerfile")).toContain("yarn prisma generate");
      });
    });

    describe("package manager dockerfile variants", () => {
      it("should use pnpm install with corepack", () => {
        generate(projectDir, { packageManager: "pnpm", docker: true });

        const dockerfile = readFile(projectDir, "Dockerfile");
        expect(dockerfile).toContain("corepack enable");
        expect(dockerfile).toContain("pnpm install");
      });

      it("should use yarn install with corepack", () => {
        generate(projectDir, { packageManager: "yarn", docker: true });

        const dockerfile = readFile(projectDir, "Dockerfile");
        expect(dockerfile).toContain("corepack enable");
        expect(dockerfile).toContain("yarn install");
      });

      it("should use npm ci for npm", () => {
        generate(projectDir, { docker: true });

        const dockerfile = readFile(projectDir, "Dockerfile");
        expect(dockerfile).toContain("npm ci");
      });
    });
  });

  describe("swagger", () => {
    it("should generate swagger file when enabled", () => {
      generate(projectDir, { swagger: true });

      expect(existsSync(join(projectDir, "src/lib/swagger.ts"))).toBe(true);
    });

    it("should not generate swagger file when disabled", () => {
      generate(projectDir, { swagger: false });

      expect(existsSync(join(projectDir, "src/lib/swagger.ts"))).toBe(false);
    });

    it("should wire swagger-ui into app.ts when enabled", () => {
      generate(projectDir, { swagger: true });

      const app = readFile(projectDir, "src/app.ts");
      expect(app).toContain('swagger-ui-express');
      expect(app).toContain("/api/docs");
      expect(app).toContain("/api/docs.json");
    });

    it("should not include swagger imports in app.ts when disabled", () => {
      generate(projectDir, { swagger: false });

      const app = readFile(projectDir, "src/app.ts");
      expect(app).not.toContain("swagger");
    });

    it("should use Task schema with title and completed fields", () => {
      generate(projectDir, { swagger: true });

      const swagger = readFile(projectDir, "src/lib/swagger.ts");
      expect(swagger).toContain("TaskSchema");
      expect(swagger).toContain("title");
      expect(swagger).toContain("completed");
      expect(swagger).toContain("/api/tasks");
    });
  });

  describe("package manager variants", () => {
    it("should ignore other lockfiles in gitignore for npm", () => {
      generate(projectDir, { packageManager: "npm" });

      const gitignore = readFile(projectDir, ".gitignore");
      expect(gitignore).toContain("pnpm-lock.yaml");
      expect(gitignore).toContain("yarn.lock");
      expect(gitignore).not.toContain("package-lock.json");
    });

    it("should ignore other lockfiles in gitignore for pnpm", () => {
      generate(projectDir, { packageManager: "pnpm" });

      const gitignore = readFile(projectDir, ".gitignore");
      expect(gitignore).toContain("package-lock.json");
      expect(gitignore).not.toContain("pnpm-lock.yaml");
    });

    it("should use pnpm exec in husky hook for pnpm", () => {
      generate(projectDir, { packageManager: "pnpm" });

      const hook = readFile(projectDir, ".husky/pre-commit");
      expect(hook).toContain("pnpm exec lint-staged");
    });

    it("should use npx in husky hook for npm", () => {
      generate(projectDir, { packageManager: "npm" });

      const hook = readFile(projectDir, ".husky/pre-commit");
      expect(hook).toContain("npx lint-staged");
    });
  });
});
