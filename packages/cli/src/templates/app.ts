import type { ProjectConfig } from "../types.js";

function escapeString(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/`/g, "\\`");
}

export function appTemplate(config: ProjectConfig): string {
  const lines: string[] = [];
  const safeName = escapeString(config.name);

  lines.push('import express from "express";');
  lines.push('import cors from "cors";');
  lines.push('import helmet from "helmet";');
  lines.push('import pinoHttp from "pino-http";');
  lines.push('import { healthRouter } from "./routes/health.js";');
  lines.push('import { taskRouter } from "./routes/tasks.js";');
  lines.push('import { errorHandler } from "./middleware/error-handler.js";');
  lines.push('import { globalLimiter } from "./middleware/rate-limit.js";');
  lines.push('import { NotFoundError } from "./lib/errors.js";');
  lines.push('import { logger } from "./lib/logger.js";');
  lines.push('import { env } from "./config/env.js";');

  if (config.swagger) {
    lines.push('import swaggerUi from "swagger-ui-express";');
    lines.push('import { swaggerSpec, swaggerUiOptions } from "./lib/swagger.js";');
  }
  lines.push("");
  lines.push("const app = express();");
  lines.push("");
  lines.push("// Middleware");
  lines.push("app.use(helmet());");
  lines.push("app.use(cors());");
  lines.push("app.use(express.json());");
  lines.push("app.use(globalLimiter);");
  lines.push("app.use(pinoHttp({ logger }));");
  lines.push("");
  lines.push("// Routes");
  lines.push('app.get("/", (_req, res) => {');
  lines.push("  res.json({");
  lines.push(`    message: "Welcome to ${safeName} API",`);
  lines.push('    version: "1.0.0",');
  lines.push("    environment: env.NODE_ENV,");
  lines.push("  });");
  lines.push("});");
  lines.push("");
  lines.push('app.use("/health", healthRouter);');
  lines.push('app.use("/api/tasks", taskRouter);');

  if (config.swagger) {
    lines.push("");
    lines.push("// API Documentation");
    lines.push('app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));');
    lines.push('app.get("/api/docs.json", (_req, res) => {');
    lines.push("  res.json(swaggerSpec);");
    lines.push("});");
  }

  lines.push("");
  lines.push("// 404 handler");
  lines.push('app.all("*path", (_req, _res) => {');
  lines.push('  throw new NotFoundError("Route not found");');
  lines.push("});");
  lines.push("");
  lines.push("// Error handler");
  lines.push("app.use(errorHandler);");
  lines.push("");
  lines.push("export default app;");
  lines.push("");

  return lines.join("\n");
}
