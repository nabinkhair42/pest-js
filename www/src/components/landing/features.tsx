import { Docker } from "@/components/icons/docker";
import { Expressjs } from "@/components/icons/express";
import { Pino } from "@/components/icons/pino";
import { TypeScript } from "@/components/icons/typescript";
import { Zod } from "@/components/icons/zod";
import type { ReactNode } from "react";
import { Database } from "lucide-react";

const features: { icon: ReactNode; title: string; description: string }[] = [
  {
    icon: <Expressjs className="size-5" />,
    title: "Express 5",
    description:
      "Latest Express with native async error handling and modern middleware APIs.",
  },
  {
    icon: <Database className="size-5" />,
    title: "Database ORMs",
    description:
      "Choose Prisma, Drizzle, or TypeORM with PostgreSQL, MySQL, or SQLite.",
  },
  {
    icon: <Docker className="size-5" />,
    title: "Docker Ready",
    description:
      "Multi-stage Dockerfile and docker-compose with database services.",
  },
  {
    icon: <TypeScript className="size-5" />,
    title: "TypeScript",
    description:
      "Strict config, ESLint flat config, Prettier, Husky pre-commit hooks.",
  },
  {
    icon: <Pino className="size-5" />,
    title: "Structured Logging",
    description:
      "Pino and pino-http for fast, JSON-structured request logging.",
  },
  {
    icon: <Zod className="size-5" />,
    title: "Request Validation",
    description:
      "Zod schemas with validation middleware, rate limiting, and error classes.",
  },
];

export function Features() {
  return (
    <section>
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="pb-6 pt-16">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Features
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Everything you need
          </h2>
          <p className="mt-2 max-w-lg text-muted-foreground">
            A complete project setup so you can focus on building your API.
          </p>
        </div>
      </div>

      {/* Grid — no own border, uses section dividers + dashed internal lines */}
      <div className="rail-bounded border-t">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`px-6 py-8 ${
                i % 3 !== 0 ? "lg:border-l lg:border-dashed" : ""
              } ${i % 2 !== 0 ? "sm:max-lg:border-l sm:max-lg:border-dashed" : ""} ${
                i >= 3 ? "lg:border-t lg:border-dashed" : ""
              } ${i >= 2 ? "sm:max-lg:border-t sm:max-lg:border-dashed" : ""} ${
                i >= 1 ? "max-sm:border-t max-sm:border-dashed" : ""
              }`}
            >
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl border bg-card [&>img]:size-5 [&>svg]:size-5">
                {feature.icon}
              </div>
              <h3 className="font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
