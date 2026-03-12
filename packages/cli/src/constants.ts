export const VERSION = "3.4.0";

export const DEPS = [
  "express",
  "cors",
  "helmet",
  "dotenv",
  "pino",
  "pino-http",
  "zod",
  "express-rate-limit",
];

export const DEV_DEPS = [
  "@types/express",
  "@types/cors",
  "@types/node",
  "typescript",
  "tsx",
  "jest",
  "ts-jest",
  "@types/jest",
  "supertest",
  "@types/supertest",
  "eslint",
  "@eslint/js",
  "typescript-eslint",
  "prettier",
  "husky",
  "lint-staged",
  "pino-pretty",
];

export const DB_DEPS = {
  prisma: {
    dependencies: ["@prisma/client"],
    devDependencies: ["prisma"],
  },
  drizzle: {
    base: {
      dependencies: ["drizzle-orm"],
      devDependencies: ["drizzle-kit"],
    },
    drivers: {
      postgresql: { dependencies: ["postgres"] },
      mysql: { dependencies: ["mysql2"] },
      sqlite: {
        dependencies: ["better-sqlite3"],
        devDependencies: ["@types/better-sqlite3"],
      },
    },
  },
  typeorm: {
    base: {
      dependencies: ["typeorm", "reflect-metadata"],
    },
    drivers: {
      postgresql: { dependencies: ["pg"] },
      mysql: { dependencies: ["mysql2"] },
      sqlite: { dependencies: ["better-sqlite3"] },
    },
  },
};

export const SWAGGER_DEPS = {
  dependencies: ["swagger-ui-express", "@asteasolutions/zod-to-openapi"],
  devDependencies: ["@types/swagger-ui-express"],
};

export const DATABASE_URLS: Record<string, Record<string, string>> = {
  postgresql: {
    prisma: "postgresql://user:password@localhost:5432/mydb?schema=public",
    drizzle: "postgresql://user:password@localhost:5432/mydb",
    typeorm: "postgresql://user:password@localhost:5432/mydb",
  },
  mysql: {
    prisma: "mysql://user:password@localhost:3306/mydb",
    drizzle: "mysql://user:password@localhost:3306/mydb",
    typeorm: "mysql://user:password@localhost:3306/mydb",
  },
  sqlite: {
    prisma: "file:./dev.db",
    drizzle: "./dev.db",
    typeorm: "./dev.db",
  },
};

export const DOCKER_DB_PORTS: Record<string, number> = {
  postgresql: 5432,
  mysql: 3306,
};

export const BANNER = `
 ____  _____ ____ _____   _
|  _ \\| ____/ ___|_   _| (_)___
| |_) |  _| \\___ \\ | |   | / __|
|  __/| |___ ___) || | _ | \\__ \\
|_|   |_____|____/ |_|(_)/ |___/
                        |__/
`;
