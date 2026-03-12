import type { GeneratorContext } from "../../types.js";
import { writeFile } from "../../utils/fs.js";

export function generateDrizzleDatabase(ctx: GeneratorContext): void {
  const { config, projectDir } = ctx;

  // drizzle.config.ts
  if (config.dbProvider === "postgresql") {
    writeFile(
      projectDir,
      "drizzle.config.ts",
      `import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`
    );

    // src/db/index.ts
    writeFile(
      projectDir,
      "src/db/index.ts",
      `import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { env } from "../config/env.js";

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema });
`
    );
  } else if (config.dbProvider === "mysql") {
    writeFile(
      projectDir,
      "drizzle.config.ts",
      `import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`
    );

    writeFile(
      projectDir,
      "src/db/index.ts",
      `import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema.js";
import { env } from "../config/env.js";

const pool = mysql.createPool(env.DATABASE_URL);
export const db = drizzle(pool, { schema, mode: "default" });
`
    );
  } else {
    // sqlite
    writeFile(
      projectDir,
      "drizzle.config.ts",
      `import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "./dev.db",
  },
});
`
    );

    writeFile(
      projectDir,
      "src/db/index.ts",
      `import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema.js";
import { env } from "../config/env.js";

const sqlite = new Database(env.DATABASE_URL || "./dev.db");
export const db = drizzle(sqlite, { schema });
`
    );
  }

  // src/db/schema.ts - example schema
  if (config.dbProvider === "postgresql") {
    writeFile(
      projectDir,
      "src/db/schema.ts",
      `import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
`
    );
  } else if (config.dbProvider === "mysql") {
    writeFile(
      projectDir,
      "src/db/schema.ts",
      `import { mysqlTable, serial, text, boolean, timestamp } from "drizzle-orm/mysql-core";

export const tasks = mysqlTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
`
    );
  } else {
    writeFile(
      projectDir,
      "src/db/schema.ts",
      `import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
`
    );
  }
}
