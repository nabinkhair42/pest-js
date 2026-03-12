import type { GeneratorContext } from "../../types.js";
import { writeFile } from "../../utils/fs.js";

const TYPEORM_TYPES: Record<string, string> = {
  postgresql: "postgres",
  mysql: "mysql",
  sqlite: "better-sqlite3",
};

export function generateTypeormDatabase(ctx: GeneratorContext): void {
  const { config, projectDir } = ctx;
  const dbType = TYPEORM_TYPES[config.dbProvider] ?? "postgres";

  // src/db/data-source.ts
  if (config.dbProvider === "sqlite") {
    writeFile(
      projectDir,
      "src/db/data-source.ts",
      `import "reflect-metadata";
import { DataSource } from "typeorm";
import { Task } from "./entities/task.js";

export const AppDataSource = new DataSource({
  type: "${dbType}",
  database: process.env.DATABASE_URL || "./dev.db",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: [Task],
  migrations: ["src/db/migrations/*.ts"],
});
`
    );
  } else {
    writeFile(
      projectDir,
      "src/db/data-source.ts",
      `import "reflect-metadata";
import { DataSource } from "typeorm";
import { Task } from "./entities/task.js";

export const AppDataSource = new DataSource({
  type: "${dbType}",
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: [Task],
  migrations: ["src/db/migrations/*.ts"],
});
`
    );
  }

  // src/db/index.ts
  writeFile(
    projectDir,
    "src/db/index.ts",
    `import { AppDataSource } from "./data-source.js";
import { logger } from "../lib/logger.js";

export async function initializeDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    logger.info("Database connection established");
  }
}

export { AppDataSource };
`
  );

  // src/db/entities/task.ts
  // Explicit column types are required because tsx (esbuild) does not
  // support emitDecoratorMetadata, so TypeORM cannot infer types.
  // SQLite uses "datetime" instead of "timestamp".
  const dateType = config.dbProvider === "sqlite" ? "datetime" : "timestamp";
  writeFile(
    projectDir,
    "src/db/entities/task.ts",
    `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Task {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column("varchar")
  title!: string;

  @Column("text", { default: "" })
  description!: string;

  @Column("boolean", { default: false })
  completed!: boolean;

  @CreateDateColumn({ type: "${dateType}" })
  createdAt!: Date;
}
`
  );
}
