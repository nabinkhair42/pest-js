import type { GeneratorContext, ProjectConfig } from "../types.js";
import { DEPS, DEV_DEPS, DB_DEPS, SWAGGER_DEPS } from "../constants.js";
import { writeJson } from "../utils/fs.js";

export function getDependencies(config: ProjectConfig): {
  deps: string[];
  devDeps: string[];
} {
  const deps = [...DEPS];
  const devDeps = [...DEV_DEPS];

  if (config.database === "prisma") {
    deps.push(...DB_DEPS.prisma.dependencies);
    devDeps.push(...DB_DEPS.prisma.devDependencies);
  } else if (config.database === "drizzle") {
    deps.push(...DB_DEPS.drizzle.base.dependencies);
    devDeps.push(...DB_DEPS.drizzle.base.devDependencies);
    const driver =
      DB_DEPS.drizzle.drivers[
        config.dbProvider as keyof typeof DB_DEPS.drizzle.drivers
      ];
    deps.push(...driver.dependencies);
    if ("devDependencies" in driver) {
      devDeps.push(
        ...(driver as { devDependencies: string[] }).devDependencies,
      );
    }
  } else if (config.database === "typeorm") {
    deps.push(...DB_DEPS.typeorm.base.dependencies);
    const driver =
      DB_DEPS.typeorm.drivers[
        config.dbProvider as keyof typeof DB_DEPS.typeorm.drivers
      ];
    deps.push(...driver.dependencies);
  }

  if (config.swagger) {
    deps.push(...SWAGGER_DEPS.dependencies);
    devDeps.push(...SWAGGER_DEPS.devDependencies);
  }

  return { deps, devDeps };
}

export function generatePackageJson(ctx: GeneratorContext): void {
  const { config, projectDir } = ctx;

  const scripts: Record<string, string> = {
    start: "node dist/server.js",
    dev: "tsx watch src/server.ts",
    build: "tsc",
    test: "NODE_ENV=test jest",
    lint: "eslint src/",
    "lint:fix": "eslint src/ --fix",
    format: 'prettier --write "src/**/*.ts"',
    "format:check": 'prettier --check "src/**/*.ts"',
    prepare: "husky || true",
  };

  if (config.database === "prisma") {
    scripts["db:generate"] = "prisma generate";
    scripts["db:migrate"] = "prisma migrate dev";
    scripts["db:push"] = "prisma db push";
    scripts["db:studio"] = "prisma studio";
  } else if (config.database === "drizzle") {
    scripts["db:generate"] = "drizzle-kit generate";
    scripts["db:migrate"] = "drizzle-kit migrate";
    scripts["db:push"] = "drizzle-kit push";
    scripts["db:studio"] = "drizzle-kit studio";
  } else if (config.database === "typeorm") {
    scripts["db:migrate"] = "tsx node_modules/typeorm/cli.js migration:run -d src/db/data-source.ts";
    scripts["db:generate"] =
      "tsx node_modules/typeorm/cli.js migration:generate -d src/db/data-source.ts";
  }

  const pkg: Record<string, unknown> = {
    name: config.name,
    version: "1.0.0",
    description: config.description,
    main: "dist/server.js",
    author: config.author,
    license: "MIT",
    scripts,
    "lint-staged": {
      "*.ts": ["eslint --fix", "prettier --write"],
    },
  };

  writeJson(projectDir, "package.json", pkg);
}
