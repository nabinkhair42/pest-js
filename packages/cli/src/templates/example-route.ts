import type { ProjectConfig } from "../types.js";

export function exampleRouteTemplate(config: ProjectConfig): string {
  switch (config.database) {
    case "prisma":
      return prismaVariant();
    case "drizzle":
      return drizzleVariant(config);
    case "typeorm":
      return typeormVariant();
    default:
      return inMemoryVariant();
  }
}

function inMemoryVariant(): string {
  return `import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { NotFoundError } from "../lib/errors.js";

export const taskRouter = Router();

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

let nextId = 1;
const tasks: Task[] = [];

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).default(""),
  }),
});

const updateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    completed: z.boolean().optional(),
  }),
});

taskRouter.get("/", (_req, res) => {
  res.json(tasks);
});

taskRouter.get("/:id", (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) throw new NotFoundError("Task not found");
  res.json(task);
});

taskRouter.post("/", validate(createSchema), (req, res) => {
  const task: Task = {
    id: nextId++,
    title: req.body.title,
    description: req.body.description,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  res.status(201).json(task);
});

taskRouter.put("/:id", validate(updateSchema), (req, res) => {
  const idx = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (idx === -1) throw new NotFoundError("Task not found");
  tasks[idx] = { ...tasks[idx], ...req.body };
  res.json(tasks[idx]);
});

taskRouter.delete("/:id", (req, res) => {
  const idx = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (idx === -1) throw new NotFoundError("Task not found");
  tasks.splice(idx, 1);
  res.status(204).end();
});
`;
}

function prismaVariant(): string {
  return `import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { NotFoundError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

export const taskRouter = Router();

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).default(""),
  }),
});

const updateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    completed: z.boolean().optional(),
  }),
});

taskRouter.get("/", async (_req, res) => {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  res.json(tasks);
});

taskRouter.get("/:id", async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: Number(req.params.id) } });
  if (!task) throw new NotFoundError("Task not found");
  res.json(task);
});

taskRouter.post("/", validate(createSchema), async (req, res) => {
  const task = await prisma.task.create({ data: req.body });
  res.status(201).json(task);
});

taskRouter.put("/:id", validate(updateSchema), async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: Number(req.params.id) } });
  if (!task) throw new NotFoundError("Task not found");
  const updated = await prisma.task.update({ where: { id: task.id }, data: req.body });
  res.json(updated);
});

taskRouter.delete("/:id", async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: Number(req.params.id) } });
  if (!task) throw new NotFoundError("Task not found");
  await prisma.task.delete({ where: { id: task.id } });
  res.status(204).end();
});
`;
}

function drizzleVariant(config: ProjectConfig): string {
  if (config.dbProvider === "mysql") {
    return drizzleMysqlVariant();
  }
  return drizzleReturningVariant();
}

function drizzleReturningVariant(): string {
  return `import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { NotFoundError } from "../lib/errors.js";
import { db } from "../db/index.js";
import { tasks } from "../db/schema.js";

export const taskRouter = Router();

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).default(""),
  }),
});

const updateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    completed: z.boolean().optional(),
  }),
});

taskRouter.get("/", async (_req, res) => {
  const result = await db.select().from(tasks);
  res.json(result);
});

taskRouter.get("/:id", async (req, res) => {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, Number(req.params.id)));
  if (!task) throw new NotFoundError("Task not found");
  res.json(task);
});

taskRouter.post("/", validate(createSchema), async (req, res) => {
  const [task] = await db.insert(tasks).values(req.body).returning();
  res.status(201).json(task);
});

taskRouter.put("/:id", validate(updateSchema), async (req, res) => {
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, Number(req.params.id)));
  if (!existing) throw new NotFoundError("Task not found");
  const [updated] = await db.update(tasks).set(req.body).where(eq(tasks.id, existing.id)).returning();
  res.json(updated);
});

taskRouter.delete("/:id", async (req, res) => {
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, Number(req.params.id)));
  if (!existing) throw new NotFoundError("Task not found");
  await db.delete(tasks).where(eq(tasks.id, existing.id));
  res.status(204).end();
});
`;
}

function drizzleMysqlVariant(): string {
  return `import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { NotFoundError } from "../lib/errors.js";
import { db } from "../db/index.js";
import { tasks } from "../db/schema.js";

export const taskRouter = Router();

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).default(""),
  }),
});

const updateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    completed: z.boolean().optional(),
  }),
});

taskRouter.get("/", async (_req, res) => {
  const result = await db.select().from(tasks);
  res.json(result);
});

taskRouter.get("/:id", async (req, res) => {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, Number(req.params.id)));
  if (!task) throw new NotFoundError("Task not found");
  res.json(task);
});

taskRouter.post("/", validate(createSchema), async (req, res) => {
  const result = await db.insert(tasks).values(req.body).$returningId();
  const [task] = await db.select().from(tasks).where(eq(tasks.id, result[0].id));
  res.status(201).json(task);
});

taskRouter.put("/:id", validate(updateSchema), async (req, res) => {
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, Number(req.params.id)));
  if (!existing) throw new NotFoundError("Task not found");
  await db.update(tasks).set(req.body).where(eq(tasks.id, existing.id));
  const [updated] = await db.select().from(tasks).where(eq(tasks.id, existing.id));
  res.json(updated);
});

taskRouter.delete("/:id", async (req, res) => {
  const [existing] = await db.select().from(tasks).where(eq(tasks.id, Number(req.params.id)));
  if (!existing) throw new NotFoundError("Task not found");
  await db.delete(tasks).where(eq(tasks.id, existing.id));
  res.status(204).end();
});
`;
}

function typeormVariant(): string {
  return `import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { NotFoundError } from "../lib/errors.js";
import { AppDataSource } from "../db/data-source.js";
import { Task } from "../db/entities/task.js";

export const taskRouter = Router();

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).default(""),
  }),
});

const updateSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    completed: z.boolean().optional(),
  }),
});

taskRouter.get("/", async (_req, res) => {
  const taskRepo = AppDataSource.getRepository(Task);
  const tasks = await taskRepo.find({ order: { createdAt: "DESC" } });
  res.json(tasks);
});

taskRouter.get("/:id", async (req, res) => {
  const taskRepo = AppDataSource.getRepository(Task);
  const task = await taskRepo.findOneBy({ id: Number(req.params.id) });
  if (!task) throw new NotFoundError("Task not found");
  res.json(task);
});

taskRouter.post("/", validate(createSchema), async (req, res) => {
  const taskRepo = AppDataSource.getRepository(Task);
  const task = taskRepo.create(req.body);
  const saved = await taskRepo.save(task);
  res.status(201).json(saved);
});

taskRouter.put("/:id", validate(updateSchema), async (req, res) => {
  const taskRepo = AppDataSource.getRepository(Task);
  const task = await taskRepo.findOneBy({ id: Number(req.params.id) });
  if (!task) throw new NotFoundError("Task not found");
  taskRepo.merge(task, req.body);
  const updated = await taskRepo.save(task);
  res.json(updated);
});

taskRouter.delete("/:id", async (req, res) => {
  const taskRepo = AppDataSource.getRepository(Task);
  const task = await taskRepo.findOneBy({ id: Number(req.params.id) });
  if (!task) throw new NotFoundError("Task not found");
  await taskRepo.remove(task);
  res.status(204).end();
});
`;
}
