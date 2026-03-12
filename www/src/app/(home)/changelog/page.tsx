import { Changelog } from "@/components/changelog";
import type { ChangelogEntry } from "@/components/changelog";

const entries: ChangelogEntry[] = [
  {
    version: "v3.4.0",
    date: "12 March 2026",
    title: "Swagger API docs & Task CRUD routes",
    description:
      "Optional Swagger/OpenAPI docs and a real Task CRUD API replacing the generic example routes.",
    items: [
      "Swagger UI at /api/docs, JSON spec at /api/docs.json (opt-in via --swagger)",
      "Task CRUD routes at /api/tasks for all 4 ORM variants",
      "OpenAPI spec auto-generated from Zod schemas",
      "Prisma SQLite Docker fix for file: prefix",
    ],
    image: "/changelogs/v3.4.0",
  },
  {
    version: "v3.3.2",
    date: "7 February 2026",
    title: "Docker & template fixes",
    description:
      "Fixes broken Docker builds for Yarn and improves generated code consistency.",
    items: [
      "Yarn Dockerfile now includes corepack enable",
      "Package-manager-specific prisma generate in Dockerfile",
      "CLI arg validation for --database, --db-provider, --package-manager",
      "Rate limiter skips in test environment",
      "80 unit tests (up from 27)",
    ],
  },
  {
    version: "v3.3.1",
    date: "6 February 2026",
    title: "Cross-platform fixes & Prisma 7",
    description:
      "Fixes Windows/macOS install issues and upgrades to Prisma 7 config format.",
    items: [
      "Windows spawn fix (single command string)",
      "Prisma 7 support with prisma.config.ts defineConfig",
      "Graceful handling when git/pnpm/yarn not installed",
      "Project name validation and sanitization",
      "Cleanup on failed generation",
    ],
  },
  {
    version: "v3.3.0",
    date: "5 February 2026",
    title: "Rate limiting & docs rewrite",
    description:
      "Adds express-rate-limit to generated projects and rewrites documentation with fumadocs components.",
    items: [
      "Rate limiting with global limiter + per-route factory",
      "Docs rewritten with fumadocs Tabs, Steps, Files, Callout",
      "Copy-to-clipboard for npx command on landing page",
    ],
  },
  {
    version: "v3.2.0",
    date: "5 February 2026",
    title: "Logging, validation & CRUD routes",
    description:
      "Adds pino logging, Zod validation middleware, custom error classes, and CRUD routes for all ORMs.",
    items: [
      "Structured logging with pino/pino-http",
      "Zod request validation middleware",
      "Custom error classes (AppError, NotFoundError, etc.)",
      "CRUD route variants for Prisma, Drizzle, TypeORM, and in-memory",
      "Package manager choice (npm, pnpm, yarn)",
      "5 bug fixes across Docker, Drizzle, TypeORM, Husky, Vercel",
    ],
    image: "/changelogs/v3.2.0",
  },
  {
    version: "v3.1.2",
    date: "5 February 2026",
    title: "Async install spinner",
    description:
      "Fixed CLI freezing during dependency installation with async spawn.",
    items: [
      "Non-blocking installs with animated spinner",
      "Separate status messages for deps and devDeps",
    ],
    image: "/changelogs/v3.1.2",
  },
  {
    version: "v3.1.1",
    date: "5 February 2026",
    title: "npm package README",
    description:
      "Added README for the npm registry page.",
    button: {
      url: "https://github.com/nabinkhair42/pest-js/blob/main/README.md",
      text: "View on GitHub",
    },
  },
  {
    version: "v3.1.0",
    date: "5 February 2026",
    title: "Latest deps & simplified CI",
    description:
      "Dependencies resolve to latest at generation time. Replaced ts-node with tsx.",
    items: [
      "Latest dependency versions resolved at project creation",
      "tsx replaces ts-node + nodemon for dev server",
      "GitHub Actions simplified from 7 checks to 2",
    ],
  },
  {
    version: "v3.0.0",
    date: "4 February 2026",
    title: "Complete rewrite in TypeScript",
    description:
      "Full rewrite from Bash to TypeScript CLI. Generates Express 5 projects with database, Docker, and testing support.",
    items: [
      "Interactive CLI with @clack/prompts",
      "Express 5 with async error handling",
      "Database ORM selection (Prisma, Drizzle, TypeORM)",
      "PostgreSQL, MySQL, SQLite support",
      "Docker multi-stage builds + compose",
      "Jest + Supertest + ESLint + Prettier + Husky",
      "Non-interactive mode with --yes flag",
    ],
    image: "/changelogs/v3.0.0",
    button: {
      url: "https://github.com/nabinkhair42/pest.js/releases/tag/v3.0.0",
      text: "View release",
    },
  },
  {
    version: "v2.0.0",
    date: "6 August 2025",
    title: "Modular Bash CLI with CI/CD",
    description:
      "Refactored CLI into modular Bash scripts with CI/CD workflows and code quality tooling.",
    items: [
      "Modular generator scripts",
      "GitHub Actions CI/CD",
      "Husky + commitlint",
      "Documentation website introduced",
    ],
    button: {
      url: "https://github.com/nabinkhair42/pest.js/releases/tag/v2.0.0",
      text: "View release",
    },
    image: "",
  },
  {
    version: "v1.0.0",
    date: "18 February 2025",
    title: "Initial release",
    description:
      "First version of PEST.js. A Bash script that scaffolds Express + TypeScript projects.",
    items: [
      "Bash-based project scaffolding",
      "Express + TypeScript generation",
      "ESLint, Prettier, Jest setup",
    ],
  },
];

export const metadata = {
  title: "Changelog",
  description: "Latest updates and improvements to PEST.js.",
};

export default function ChangelogPage() {
  return (
    <Changelog
      title="Changelog"
      description="Latest updates and improvements to PEST.js."
      entries={entries}
    />
  );
}
