import type { ProjectConfig } from "../types.js";

function escapeString(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/`/g, "\\`");
}

export function swaggerTemplate(config: ProjectConfig): string {
  const safeName = escapeString(config.name);
  const safeDescription = escapeString(config.description);

  return `import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// --- Schemas ---

const TaskSchema = registry.register(
  "Task",
  z.object({
    id: z.number().openapi({ example: 1 }),
    title: z.string().openapi({ example: "Set up CI pipeline" }),
    description: z.string().openapi({ example: "Configure GitHub Actions for automated testing" }),
    completed: z.boolean().openapi({ example: false }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  }).openapi("Task")
);

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(255).openapi({ example: "Set up CI pipeline" }),
  description: z.string().max(1000).optional().openapi({ example: "Configure GitHub Actions for automated testing" }),
}).openapi("CreateTask");

const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional().openapi({ example: "Update CI pipeline" }),
  description: z.string().max(1000).optional().openapi({ example: "Add deployment stage" }),
  completed: z.boolean().optional().openapi({ example: true }),
}).openapi("UpdateTask");

const HealthSchema = z.object({
  status: z.string().openapi({ example: "ok" }),
  timestamp: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  uptime: z.number().openapi({ example: 123.456 }),
}).openapi("Health");

// --- Paths ---

registry.registerPath({
  method: "get",
  path: "/health",
  summary: "Health check",
  tags: ["Health"],
  responses: {
    200: {
      description: "Service is healthy",
      content: { "application/json": { schema: HealthSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/tasks",
  summary: "List all tasks",
  tags: ["Tasks"],
  responses: {
    200: {
      description: "List of tasks",
      content: { "application/json": { schema: z.array(TaskSchema) } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/tasks/{id}",
  summary: "Get a task by ID",
  tags: ["Tasks"],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
  },
  responses: {
    200: {
      description: "Task details",
      content: { "application/json": { schema: TaskSchema } },
    },
    404: { description: "Task not found" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/tasks",
  summary: "Create a task",
  tags: ["Tasks"],
  request: {
    body: {
      content: { "application/json": { schema: CreateTaskSchema } },
    },
  },
  responses: {
    201: {
      description: "Created task",
      content: { "application/json": { schema: TaskSchema } },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/tasks/{id}",
  summary: "Update a task",
  tags: ["Tasks"],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
    body: {
      content: { "application/json": { schema: UpdateTaskSchema } },
    },
  },
  responses: {
    200: {
      description: "Updated task",
      content: { "application/json": { schema: TaskSchema } },
    },
    404: { description: "Task not found" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/tasks/{id}",
  summary: "Delete a task",
  tags: ["Tasks"],
  request: {
    params: z.object({ id: z.string().openapi({ example: "1" }) }),
  },
  responses: {
    204: { description: "Task deleted" },
    404: { description: "Task not found" },
  },
});

// --- Generate spec ---

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.3",
  info: {
    title: "${safeName} API",
    version: "1.0.0",
    description: "${safeDescription}",
  },
});

export const swaggerUiOptions = {
  customSiteTitle: "${safeName} API Docs",
};
`;
}
