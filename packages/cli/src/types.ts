export type DatabaseORM = "prisma" | "drizzle" | "typeorm" | "none";

export type DatabaseProvider = "postgresql" | "mysql" | "sqlite";

export type PackageManager = "npm" | "pnpm" | "yarn";

export interface ProjectConfig {
  name: string;
  description: string;
  author: string;
  database: DatabaseORM;
  dbProvider: DatabaseProvider;
  docker: boolean;
  swagger: boolean;
  git: boolean;
  install: boolean;
  packageManager: PackageManager;
}

export interface GeneratorContext {
  config: ProjectConfig;
  projectDir: string;
}
